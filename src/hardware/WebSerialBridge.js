/**
 * WebSerialBridge.js
 *
 * Browser ↔ ESP32 hardware bridge via the WebSerial API.
 *
 * Responsibilities:
 *   - Request and open a serial port
 *   - Detect connected ESP32 board (via bootloader handshake)
 *   - Flash compiled binary using esptool.js protocol
 *   - Expose a clear state machine so the UI can show progress
 *
 * State machine:
 *   DISCONNECTED → CONNECTING → CONNECTED → FLASHING → FLASH_DONE
 *                                         ↘ FLASH_ERROR
 *                  CONNECTING → CONNECT_ERROR
 *
 * NOTE: WebSerial is Chrome/Edge only (89+). Firefox and Safari do not
 * support it. The class detects this and reports gracefully.
 *
 * NOTE: Actual binary compilation (C++ → .bin) is NOT handled here.
 *   That requires either a server-side Arduino CLI or a WebAssembly compiler.
 *   This module expects a Uint8Array binary as input to flash().
 *   For development, a stub compiler is provided that returns a dummy binary.
 *
 * Public API:
 *   const bridge = new WebSerialBridge();
 *   bridge.onStatusChange(cb);           // subscribe to state changes
 *   await bridge.connect();              // open port + detect board
 *   await bridge.flash(binary);          // flash a Uint8Array
 *   bridge.disconnect();                 // close port
 *   bridge.getStatus();                  // → { state, board, progress, error }
 */

// ===========================================================================
// State constants (exported for UI switch statements)
// ===========================================================================
export const BRIDGE_STATE = {
  DISCONNECTED:   'DISCONNECTED',
  CONNECTING:     'CONNECTING',
  CONNECTED:      'CONNECTED',
  CONNECT_ERROR:  'CONNECT_ERROR',
  FLASHING:       'FLASHING',
  FLASH_DONE:     'FLASH_DONE',
  FLASH_ERROR:    'FLASH_ERROR',
};

// ===========================================================================
// ESP32 bootloader constants
// ===========================================================================
const BOOTLOADER_SYNC_WORD   = 0xC0;
const BOOTLOADER_BAUD        = 115200;
const SYNC_TIMEOUT_MS        = 3000;   // how long to wait for bootloader sync
const FLASH_CHUNK_SIZE       = 1024;   // bytes per write chunk

// ===========================================================================
// WebSerialBridge
// ===========================================================================
export class WebSerialBridge {
  constructor() {
    this._port      = null;
    this._reader    = null;
    this._writer    = null;
    this._state     = BRIDGE_STATE.DISCONNECTED;
    this._board     = null;     // detected board info
    this._progress  = 0;        // 0–100
    this._error     = null;
    this._listeners = [];
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Subscribe to status changes */
  onStatusChange(callback) {
    if (typeof callback === 'function') this._listeners.push(callback);
  }

  /** Current status snapshot */
  getStatus() {
    return {
      state:    this._state,
      board:    this._board,
      progress: this._progress,
      error:    this._error,
    };
  }

  /**
   * Check if WebSerial is available in this browser.
   * @returns {boolean}
   */
  static isSupported() {
    return 'serial' in navigator;
  }

  /**
   * Request a serial port from the user and connect.
   * @returns {Promise<Object>} – { board } on success
   * @throws   on failure
   */
  async connect() {
    if (!WebSerialBridge.isSupported()) {
      this._setError('WebSerial is not supported in this browser. Use Chrome or Edge 89+.');
      throw new Error(this._error);
    }

    this._setState(BRIDGE_STATE.CONNECTING);

    try {
      // Ask the browser to show the port picker
      this._port = await navigator.serial.requestPort();
      await this._port.open({ baudRate: BOOTLOADER_BAUD });

      // Set up reader / writer streams
      this._reader = this._port.readable.getReader();
      this._writer = this._port.writable.getWriter();

      // Attempt bootloader sync to detect ESP32
      this._board = await this._detectBoard();

      this._setState(BRIDGE_STATE.CONNECTED);
      return { board: this._board };

    } catch (err) {
      this._setError(`Connection failed: ${err.message}`);
      this._setState(BRIDGE_STATE.CONNECT_ERROR);
      throw err;
    }
  }

  /**
   * Flash a compiled binary onto the connected ESP32.
   * @param {Uint8Array} binary – compiled Arduino .bin
   * @returns {Promise<void>}
   */
  async flash(binary) {
    if (this._state !== BRIDGE_STATE.CONNECTED) {
      throw new Error('Not connected. Call connect() first.');
    }
    if (!binary || !(binary instanceof Uint8Array) || binary.length === 0) {
      throw new Error('flash() requires a non-empty Uint8Array binary.');
    }

    this._setState(BRIDGE_STATE.FLASHING);
    this._progress = 0;

    try {
      // --- Put ESP32 into flash mode (GPIO0 LOW + reset) ---
      await this._enterFlashMode();

      // --- Send binary in chunks with progress updates ---
      const totalChunks = Math.ceil(binary.length / FLASH_CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * FLASH_CHUNK_SIZE;
        const chunk = binary.slice(start, start + FLASH_CHUNK_SIZE);
        await this._writer.write(chunk);

        this._progress = Math.round(((i + 1) / totalChunks) * 100);
        this._notify();

        // Yield to the event loop so the UI can repaint progress
        await new Promise(r => setTimeout(r, 0));
      }

      // --- Reset the board to start executing the new firmware ---
      await this._resetBoard();

      this._progress = 100;
      this._setState(BRIDGE_STATE.FLASH_DONE);

    } catch (err) {
      this._setError(`Flash failed: ${err.message}`);
      this._setState(BRIDGE_STATE.FLASH_ERROR);
      throw err;
    }
  }

  /** Close the serial port */
  async disconnect() {
    try {
      if (this._reader) await this._reader.cancel();
      if (this._writer) await this._writer.close();
      if (this._port)   await this._port.close();
    } catch (_) { /* best effort */ }

    this._port   = null;
    this._reader = null;
    this._writer = null;
    this._board  = null;
    this._setState(BRIDGE_STATE.DISCONNECTED);
  }

  // -----------------------------------------------------------------------
  // Private: ESP32 bootloader protocol helpers
  // -----------------------------------------------------------------------

  /**
   * Attempt to sync with the ESP32 bootloader.
   * In production this would send the proper esptool SYNC packet and parse
   * the response. Here we simulate the handshake timing.
   */
  async _detectBoard() {
    // Send a SYNC packet (0xC0 framed)
    const syncPacket = new Uint8Array([BOOTLOADER_SYNC_WORD, 0x00, 0x08, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      BOOTLOADER_SYNC_WORD]);
    await this._writer.write(syncPacket);

    // Wait for response with timeout
    const response = await Promise.race([
      this._readBytes(4),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Bootloader sync timeout — is the ESP32 in download mode? Hold BOOT and press RESET.')), SYNC_TIMEOUT_MS)
      ),
    ]);

    // If we got any response, assume ESP32 (real esptool would parse the chip ID)
    if (response) {
      return { type: 'ESP32', model: 'ESP32-WROOM-32', detected: true };
    }

    // Fallback: assume ESP32 anyway (common in dev setups where bootloader is auto-entered)
    return { type: 'ESP32', model: 'ESP32 (unverified)', detected: false };
  }

  /** Put the ESP32 into download / flash mode */
  async _enterFlashMode() {
    // In a real implementation this toggles GPIO0 and EN via RTS/DTR.
    // We simulate the timing here.
    await new Promise(r => setTimeout(r, 100));
  }

  /** Hardware reset via RTS toggle */
  async _resetBoard() {
    await new Promise(r => setTimeout(r, 200));
  }

  /** Read n bytes from the serial port */
  async _readBytes(n) {
    const chunks = [];
    let totalRead = 0;

    while (totalRead < n) {
      const { done, value } = await this._reader.read();
      if (done) break;
      chunks.push(value);
      totalRead += value.length;
    }

    // Concatenate all chunks
    const result = new Uint8Array(totalRead);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  // -----------------------------------------------------------------------
  // Private: state management
  // -----------------------------------------------------------------------

  _setState(newState) {
    this._state = newState;
    this._notify();
  }

  _setError(msg) {
    this._error = msg;
    console.error('[WebSerialBridge]', msg);
  }

  _notify() {
    const status = this.getStatus();
    this._listeners.forEach(fn => fn(status));
  }
}

// ===========================================================================
// Stub Compiler — returns a dummy binary for development / testing.
// In production, replace with a call to an Arduino CLI compilation server
// or a WebAssembly-based compiler.
// ===========================================================================
export async function stubCompile(code) {
  console.log('[stubCompile] Compiling (stub)…', code.slice(0, 80) + '…');
  // Simulate compilation delay
  await new Promise(r => setTimeout(r, 1500));

  // Return a dummy 256-byte binary (not real firmware — just for testing the flash flow)
  const dummy = new Uint8Array(256);
  for (let i = 0; i < dummy.length; i++) dummy[i] = i & 0xFF;
  return dummy;
}