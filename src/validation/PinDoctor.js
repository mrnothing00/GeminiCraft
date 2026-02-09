/**
 * src/validation/PinDoctor.js
 * Intelligent GPIO pin validator & Conflict Detector
 * OPTIMIZED: Pure logic engine. Delegates AI explanations to GuideOrchestrator.
 */

export const STATUS = {
  VALID:   'VALID',
  WARNING: 'WARNING',
  BLOCKED: 'BLOCKED',
};

// --- ESP32 "Truth Table" ---
const PIN_DB = {
  ESP32: {
    // --- Power Pins ---
    'GND': { capability: 'POWER', features: [], notes: 'Ground' },
    '5V':  { capability: 'POWER', features: [], notes: '5V / VIN' },
    'VIN': { capability: 'POWER', features: [], notes: 'Voltage In' },
    '3V3': { capability: 'POWER', features: [], notes: '3.3V Output' },

    // --- Input Only (ADC1 - Safe for Analog) ---
    '34': { capability: 'INPUT_ONLY', features: ['ADC1'], notes: 'Input Only. Best for Sensors.' },
    '35': { capability: 'INPUT_ONLY', features: ['ADC1'], notes: 'Input Only. Best for Sensors.' },
    '36': { capability: 'INPUT_ONLY', features: ['ADC1'], notes: 'VP - Input Only.' },
    '39': { capability: 'INPUT_ONLY', features: ['ADC1'], notes: 'VN - Input Only.' },

    // --- Dangerous Flash Pins (CRITICAL BLOCK) ---
    '6':  { capability: 'INTERNAL', features: [], notes: 'Connected to SPI Flash. DO NOT USE.' },
    '7':  { capability: 'INTERNAL', features: [], notes: 'Connected to SPI Flash. DO NOT USE.' },
    '8':  { capability: 'INTERNAL', features: [], notes: 'Connected to SPI Flash. DO NOT USE.' },
    '9':  { capability: 'INTERNAL', features: [], notes: 'Connected to SPI Flash. DO NOT USE.' },
    '10': { capability: 'INTERNAL', features: [], notes: 'Connected to SPI Flash. DO NOT USE.' },
    '11': { capability: 'INTERNAL', features: [], notes: 'Connected to SPI Flash. DO NOT USE.' },

    // --- Boot Sensitive ---
    '0':  { capability: 'IO', features: ['PWM', 'ADC2', 'BOOT'], bootSensitive: true, notes: 'Boot Mode Pin.' },
    '2':  { capability: 'IO', features: ['PWM', 'ADC2', 'LED'],  bootSensitive: true, notes: 'Onboard LED. Boot sensitive.' },
    '12': { capability: 'IO', features: ['PWM', 'ADC2'],         bootSensitive: true, notes: 'Boot Fail if High.' },
    '15': { capability: 'IO', features: ['PWM', 'ADC2'],         bootSensitive: true, notes: 'PWM on Boot.' },

    // --- Standard IO ---
    '4':  { capability: 'IO', features: ['PWM', 'ADC2'], notes: 'Safe GPIO' },
    '5':  { capability: 'IO', features: ['PWM'],         notes: 'VSPI CS' },
    '13': { capability: 'IO', features: ['PWM', 'ADC2'], notes: 'Safe GPIO' },
    '14': { capability: 'IO', features: ['PWM', 'ADC2'], notes: 'Safe GPIO' },
    '16': { capability: 'IO', features: ['PWM', 'UART'], notes: 'RX2' },
    '17': { capability: 'IO', features: ['PWM', 'UART'], notes: 'TX2' },
    '18': { capability: 'IO', features: ['PWM', 'SPI'],  notes: 'VSPI CLK' },
    '19': { capability: 'IO', features: ['PWM', 'SPI'],  notes: 'VSPI MISO' },
    '21': { capability: 'I2C',features: ['SDA', 'PWM'],  notes: 'Standard SDA' },
    '22': { capability: 'I2C',features: ['SCL', 'PWM'],  notes: 'Standard SCL' },
    '23': { capability: 'IO', features: ['PWM', 'SPI'],  notes: 'VSPI MOSI' },
    '25': { capability: 'IO', features: ['DAC', 'ADC2', 'PWM'], notes: 'DAC1' },
    '26': { capability: 'IO', features: ['DAC', 'ADC2', 'PWM'], notes: 'DAC2' },
    '27': { capability: 'IO', features: ['PWM', 'ADC2'], notes: 'Safe GPIO' },
    '32': { capability: 'IO', features: ['PWM', 'ADC1'], notes: 'Solid Choice - ADC1' }, 
    '33': { capability: 'IO', features: ['PWM', 'ADC1'], notes: 'Solid Choice - ADC1' }, 
  }
};

const COMPONENT_REQUIREMENTS = {
  DC_MOTOR:      { needs: ['PWM'],       category: 'OUTPUT', description: 'Motor control requires PWM for speed control' },
  LED:           { needs: ['PWM'],       category: 'OUTPUT', description: 'LED brightness control via PWM' },
  RGB_LED:       { needs: ['PWM'],       category: 'OUTPUT', description: 'RGB LED needs 3 PWM pins for color mixing' },
  NEOPIXEL:      { needs: [],            category: 'OUTPUT', description: 'Addressable LED uses digital signal' },
  SERVO:         { needs: ['PWM'],       category: 'OUTPUT', description: 'Servo motor requires PWM for position control' },
  RELAY:         { needs: [],            category: 'OUTPUT', description: 'Simple digital on/off control' },
  BUZZER:        { needs: [],            category: 'OUTPUT', description: 'Digital or PWM for tones' },
  SPEAKER:       { needs: ['PWM'],       category: 'OUTPUT', description: 'Audio output via PWM' },
  
  I2C_LCD:       { needs: ['SDA','SCL'], category: 'I2C',    description: 'I2C display needs dedicated SDA/SCL pins' },
  OLED:          { needs: ['SDA','SCL'], category: 'I2C',    description: 'I2C OLED display' }, 
  LCD:           { needs: ['SDA','SCL'], category: 'I2C',    description: 'I2C LCD display' },
  BME280:        { needs: ['SDA','SCL'], category: 'I2C',    description: 'I2C environmental sensor' },
  BMP280:        { needs: ['SDA','SCL'], category: 'I2C',    description: 'I2C pressure sensor' },
  BH1750:        { needs: ['SDA','SCL'], category: 'I2C',    description: 'I2C light sensor' },
  
  SENSOR:        { needs: [],            category: 'INPUT',  description: 'Generic sensor input' },
  DHT11:         { needs: [],            category: 'INPUT',  description: 'Digital temperature/humidity sensor' },
  DHT22:         { needs: [],            category: 'INPUT',  description: 'Digital temperature/humidity sensor' },
  DS18B20:       { needs: [],            category: 'INPUT',  description: 'Digital temperature sensor' },
  PIR:           { needs: [],            category: 'INPUT',  description: 'Motion detection sensor' },
  BUTTON:        { needs: [],            category: 'INPUT',  description: 'Digital input button' },
  SWITCH:        { needs: [],            category: 'INPUT',  description: 'Toggle switch input' },
  
  POTENTIOMETER: { needs: ['ADC1'],      category: 'INPUT',  description: 'Analog input requires ADC' }, 
  LDR:           { needs: ['ADC1'],      category: 'INPUT',  description: 'Light sensor - analog input' },
  SOIL:          { needs: ['ADC1'],      category: 'INPUT',  description: 'Soil moisture - analog input' },
  NTC:           { needs: ['ADC1'],      category: 'INPUT',  description: 'Temperature - analog input' },
  
  RESISTOR:      { needs: [],            category: 'PASSIVE', description: 'Passive component' },
  CAPACITOR:     { needs: [],            category: 'PASSIVE', description: 'Passive component' },
};

export class PinDoctor {
  constructor() {
    this.pinDB = PIN_DB;
    this.listeners = {};
    // ✅ NEW: Track used pins for collision detection
    this.pinUsageRegistry = new Map(); 
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * ✅ NEW: Update the internal registry of what is connected where
   * Call this whenever the circuit changes (e.g. from App.jsx)
   */
  updateCircuitState(circuitComponents) {
    this.pinUsageRegistry.clear();
    
    circuitComponents.forEach(comp => {
      if (comp.connectedPin) {
        const pin = String(comp.connectedPin).replace('GPIO', '').trim();
        if (this.pinUsageRegistry.has(pin)) {
           this.pinUsageRegistry.get(pin).push(comp.label || comp.type);
        } else {
           this.pinUsageRegistry.set(pin, [comp.label || comp.type]);
        }
      }
    });
  }

  validate(component, targetPin, board = 'ESP32') {
    const cleanPin = String(targetPin).replace('GPIO', '').trim();
    
    const boardDB = this.pinDB[board];
    const pinSpec = boardDB?.[cleanPin];
    const compReq = COMPONENT_REQUIREMENTS[component.type] || COMPONENT_REQUIREMENTS['SENSOR']; 

    let result;

    if (!pinSpec) {
       result = { 
         status: STATUS.BLOCKED, 
         error: `Pin "${targetPin}" not found on ESP32 pinout.`, 
         suggestion: "Use a valid GPIO pin (0-39, excluding 6-11).",
         suggestedPins: this._findAlternatives(compReq, board)
       };
    } else if (compReq.category === 'PASSIVE') {
       result = { 
         status: STATUS.VALID, 
         suggestion: 'Passive component - any pin works.', 
         suggestedPins: [] 
       };
    } else {
       // 1. Run physics/hardware checks
       result = this._runValidationChecks(component, cleanPin, board, pinSpec, compReq);
       
       // 2. ✅ NEW: Run collision checks (only if hardware check passed)
       if (result.status === STATUS.VALID) {
          const collisionCheck = this._checkCollisions(component, cleanPin);
          if (collisionCheck) {
            result = collisionCheck;
          }
       }
    }

    // Emit result so GuideOrchestrator can pick it up and generate AI explanation if needed
    this._recordAndEmit(component, cleanPin, board, result);
    return result;
  }

  /**
   * ✅ NEW: Detect if pin is already occupied
   */
  _checkCollisions(component, pin) {
    const occupants = this.pinUsageRegistry.get(pin);
    
    // If occupants exist, and it's not JUST this component itself (re-validating)
    if (occupants && occupants.length > 0) {
      // Allow I2C bus sharing (special exception)
      const isI2C = COMPONENT_REQUIREMENTS[component.type]?.category === 'I2C';
      if (isI2C) {
         return null; // I2C devices can share pins!
      }

      return {
        status: STATUS.BLOCKED,
        error: `GPIO ${pin} is already used by ${occupants[0]}`,
        suggestion: `Two components cannot share one pin (unless I2C). Move one of them.`,
        suggestedPins: [] // Let the user pick a free one
      };
    }
    return null;
  }

  _runValidationChecks(component, targetPin, board, pinSpec, compReq) {
    if (pinSpec.capability === 'POWER') {
        return { status: STATUS.VALID, suggestion: 'Power connection accepted.', suggestedPins: [] };
    }

    if (pinSpec.capability === 'INTERNAL') {
      return {
        status: STATUS.BLOCKED,
        error: `GPIO ${targetPin} is connected to internal SPI Flash - CANNOT BE USED`,
        suggestion: `Using GPIO 6-11 will brick your ESP32. Use safe pins instead.`,
        suggestedPins: this._findAlternatives(compReq, board),
      };
    }

    if (pinSpec.capability === 'INPUT_ONLY' && compReq.category === 'OUTPUT') {
      return {
        status: STATUS.BLOCKED,
        error: `GPIO ${targetPin} is INPUT-ONLY - cannot drive ${component.type}`,
        suggestion: `This pin cannot output voltage. Choose a standard GPIO pin with output capability.`,
        suggestedPins: this._findAlternatives(compReq, board),
      };
    }

    if (compReq.category === 'I2C') {
      if (pinSpec.capability !== 'I2C') {
        return {
          status: STATUS.WARNING,
          error: `GPIO ${targetPin} is not the standard I2C pin`,
          suggestion: 'For I2C devices, use GPIO 21 (SDA) and GPIO 22 (SCL) for best compatibility.',
          suggestedPins: ['21', '22'],
        };
      }
    }

    if (compReq.needs.includes('ADC1')) {
      if (!pinSpec.features.includes('ADC1') && !pinSpec.features.includes('ADC2')) {
        return {
          status: STATUS.BLOCKED,
          error: `GPIO ${targetPin} has no ADC capability`,
          suggestion: `${component.type} needs analog input. Use ADC1 pins (32-39) for WiFi compatibility.`,
          suggestedPins: ['32', '33', '34', '35'],
        };
      }
      
      if (pinSpec.features.includes('ADC2')) {
        return {
          status: STATUS.WARNING,
          error: `GPIO ${targetPin} uses ADC2 - conflicts with WiFi`,
          suggestion: `ADC2 pins stop working when WiFi is active. Use ADC1 (GPIO 32-39) instead.`,
          suggestedPins: ['32', '33', '34', '35'],
        };
      }
    }

    if (compReq.needs.includes('PWM') && !pinSpec.features.includes('PWM')) {
       return {
         status: STATUS.BLOCKED,
         error: `GPIO ${targetPin} does not support PWM`,
         suggestion: `${component.type} requires PWM for control. Choose a PWM-capable pin.`,
         suggestedPins: this._findAlternatives(compReq, board),
       };
    }

    if (pinSpec.bootSensitive) {
      return {
        status: STATUS.WARNING,
        error: `GPIO ${targetPin} affects boot behavior`,
        suggestion: `This pin is checked during startup. Hardware here might prevent booting. Consider GPIO 4, 16, or 17.`,
        suggestedPins: this._findSafePins(compReq, board),
      };
    }

    return { 
      status: STATUS.VALID, 
      error: null, 
      suggestion: `GPIO ${targetPin} is compatible with ${component.type}.`, 
      suggestedPins: [] 
    };
  }

  _findAlternatives(compReq, board, limit = 3) {
    const boardDB = this.pinDB[board];
    if (!boardDB) return [];

    // Filter out used pins from the registry
    const usedPins = new Set(this.pinUsageRegistry.keys());

    return Object.entries(boardDB)
      .filter(([pin, spec]) => {
        if (usedPins.has(pin) && compReq.category !== 'I2C') return false; // Skip used pins (unless I2C)
        if (spec.capability === 'INTERNAL' || spec.capability === 'POWER') return false;
        if (compReq.category === 'OUTPUT' && spec.capability === 'INPUT_ONLY') return false;
        if (compReq.category === 'I2C' && spec.capability !== 'I2C') return false;
        if (compReq.needs.includes('ADC1') && !spec.features.includes('ADC1')) return false;
        if (compReq.needs.includes('PWM') && !spec.features.includes('PWM')) return false;
        if (spec.bootSensitive) return false;
        return true;
      })
      .map(([pin]) => pin) 
      .slice(0, limit);
  }

  _findSafePins(compReq, board, limit = 3) {
    const safeDefaults = ['4', '16', '17', '5', '18', '19', '23'];
    const boardDB = this.pinDB[board];
    
    const usedPins = new Set(this.pinUsageRegistry.keys());

    return safeDefaults
      .filter(pin => {
        if (usedPins.has(pin)) return false; // Skip used
        const spec = boardDB[pin];
        if (!spec) return false;
        if (compReq.needs.includes('ADC1') && !spec.features.includes('ADC1')) return false;
        if (compReq.needs.includes('PWM') && !spec.features.includes('PWM')) return false;
        if (compReq.category === 'I2C' && spec.capability !== 'I2C') return false;
        return true;
      })
      .slice(0, limit);
  }

  _recordAndEmit(component, targetPin, board, result) {
    const data = {
      component_id: component.id,
      component_type: component.type,
      pin: targetPin,
      result: result,
      timestamp: Date.now()
    };
    if (result.status === STATUS.BLOCKED) this.emit('error', data);
    else if (result.status === STATUS.WARNING) this.emit('warning', data);
    else this.emit('success', data);
  }
}