/**
 * src/simulation/VirtualSimulator.js - FIXED v8
 * * FEATURES:
 * 1. ✅ Fixed Serial.printf: Added support to prevent "printf is not a function" crash.
 * 2. ✅ Universal Sensor Mapping: ALL sensors read from Environment Sliders.
 * 3. ✅ Syntax Fixes: Handles isnan() and C++ modifiers automatically.
 */

export class VirtualSimulator {
  constructor() {
    this.running = false;
    this.pins = new Array(40).fill(0);
    this.pinModes = new Array(40).fill(0);
    this.intervalId = null;
    this.subscribers = [];
    this.startTime = 0;
    this._abortController = null;

    // The Global Environment
    this.env = {
      temperature: 25,
      humidity: 50,
      lux: 500,
      pressure: 1013,
      potentiometers: {}, // Maps Pin -> Analog Value (0-4095)
      servos: {},
      oled_text: 'Ready',
      lcd_text: ['Ready', ''],
      seven_seg_value: '0000',
    };

    // Store mappings: Which Pin is connected to Which Environmental Factor?
    this.analogMappings = []; 

    if (typeof window !== 'undefined') {
      // Called by UI Sliders
      window.__updateEnv = (key, val, compId = null, pin = null) => {
        if (compId && pin !== null) {
          // Direct component interaction (e.g. turning a potentiometer knob)
          this.env.potentiometers[pin] = parseInt(val);
          this.pins[pin] = parseInt(val);
        } else if (key) {
          // Environment Slider interaction (Temp, Lux, etc.)
          this.env[key] = parseFloat(val);
          this._updateAnalogSensors(key); // Sync analog pins immediately
        }
        this._broadcastState();
      };

      window.__simSetInput = (pin, value) => {
        const p = this._resolvePin(pin);
        this.pins[p] = value;
        this._broadcastState();
      };
    }
  }

  // --- ANALOG CALCULATION: Maps Env Values to Voltage (0-4095) ---
  _updateAnalogSensors(changedEnvKey) {
    this.analogMappings.forEach(mapping => {
      if (mapping.envKey === changedEnvKey) {
        // Map the environmental value to a 12-bit ADC value (0-4095)
        const rawVal = this.env[mapping.envKey];
        
        // Calculate percentage (0.0 to 1.0) based on sensor range
        const percent = (rawVal - mapping.min) / (mapping.max - mapping.min);
        const clampedPercent = Math.max(0, Math.min(1, percent));
        
        // 12-bit ADC (ESP32 standard)
        const analogVal = Math.floor(clampedPercent * 4095);
        
        this.env.potentiometers[mapping.pin] = analogVal;
      }
    });
  }

  load(code, circuit) {
    this.code = code;
    this.components = circuit.components || [];
    this.wires = circuit.wires || [];

    this.env.potentiometers = {};
    this.env.servos = {};
    this.analogMappings = []; // Reset mappings
    this.pins.fill(0);
    this.pinModes.fill(0);

    // 1. Scan circuit to auto-configure sensors
    this.components.forEach(c => {
      // Find the pin this component is connected to
      const wire = this.wires.find(w => w.to?.component === c.id || w.from?.component === c.id);
      
      let pin = null;
      if (wire) {
        const fromIsESP = wire.from?.component !== c.id;
        const espEnd = fromIsESP ? wire.from : wire.to;
        if (espEnd?.pin) {
           pin = parseInt(String(espEnd.pin).replace(/\D/g, ''), 10);
        }
      }

      const type = c.type.toUpperCase();

      // --- AUTO-MAP ANALOG SENSORS ---
      if (!isNaN(pin)) {
        // Light Sensors -> Lux Slider
        if (['LDR', 'BH1750', 'TEMT6000', 'PHOTORESISTOR'].some(t => type.includes(t))) {
          this.analogMappings.push({ pin, envKey: 'lux', min: 0, max: 1000 });
          this.env.potentiometers[pin] = 2048; 
        }
        // Temp Sensors (Analog) -> Temp Slider
        else if (['NTC', 'LM35', 'TMP36', 'THERMISTOR'].some(t => type.includes(t))) {
          this.analogMappings.push({ pin, envKey: 'temperature', min: -10, max: 50 });
          this.env.potentiometers[pin] = 2048; 
        }
        // Soil/Water Sensors -> Humidity Slider
        else if (['SOIL', 'MOISTURE', 'WATER'].some(t => type.includes(t))) {
          this.analogMappings.push({ pin, envKey: 'humidity', min: 0, max: 100 });
          this.env.potentiometers[pin] = 2048;
        }
        // Manual Potentiometers
        else if (type.includes('POTENTIOMETER')) {
          this.env.potentiometers[pin] = 0;
        }
      }
    });
    
    // Initial sync
    this._updateAnalogSensors('lux');
    this._updateAnalogSensors('temperature');
    this._updateAnalogSensors('humidity');
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = Date.now();
    this._abortController = new AbortController();
    console.log('🚀 Simulation Engine Started');

    try {
      const jsCode = this._transpileToJS(this.code);
      const api = this._getArduinoAPI();
      const mocks = this._getMockClasses(api);

      const sandboxFn = new Function(
        'HIGH', 'LOW', 'OUTPUT', 'INPUT', 'INPUT_PULLUP',
        'pinMode', 'digitalWrite', 'digitalRead',
        'analogRead', 'analogWrite', 'ledcSetup', 'ledcAttachPin', 'ledcWrite',
        'delay', 'millis', 'Serial',
        'map', 'constrain', 'tone', 'noTone',
        'env',
        'DHT', 'Servo', 'LiquidCrystal_I2C', 'Adafruit_NeoPixel',
        'Adafruit_SSD1306', 'Adafruit_BME280', 'Adafruit_BMP280',
        'DallasTemperature', 'OneWire',
        'DHT11', 'DHT22',
        'SSD1306_SWITCHCAPVCC', 'SCREEN_WIDTH', 'SCREEN_HEIGHT',
        'Wire',
        `
        return (async function __sandboxMain__() {
          try {
            ${jsCode}
            if (typeof setup === 'function') await setup();
            if (typeof loop === 'function') {
              while (true) {
                await loop();
                await delay(16);
              }
            }
          } catch (e) {
            if (e === '__SIM_STOP__') return;
            console.error('❌ Simulation Runtime Error:', e);
          }
        });
        `
      );

      this.executable = sandboxFn(
        1, 0, 1, 0, 2,
        api.pinMode, api.digitalWrite, api.digitalRead,
        api.analogRead, api.analogWrite,
        api.ledcSetup, api.ledcAttachPin, api.ledcWrite,
        api.delay, api.millis, api.Serial,
        api.map, api.constrain, api.tone, api.noTone,
        this.env,
        mocks.DHT, mocks.Servo, mocks.LiquidCrystal_I2C, mocks.Adafruit_NeoPixel,
        mocks.Adafruit_SSD1306, mocks.Adafruit_BME280, mocks.Adafruit_BMP280,
        mocks.DallasTemperature, mocks.OneWire,
        11, 22,
        0x3C, 128, 64,
        mocks.Wire
      );

      this.executable().catch(e => {
        if (e !== '__SIM_STOP__') console.error('[Sim] Unexpected exit:', e);
      });

      if (this.intervalId) clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        if (this.running) this._broadcastState();
      }, 50);
    } catch (e) {
      console.error('❌ Simulation Compilation Failed:', e);
      this.stop();
    }
  }

  stop() {
    this.running = false;
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this._broadcastState();
    console.log('⏹ Simulation Stopped');
  }

  onStateChange(callback) {
    this.subscribers.push(callback);
  }

  _broadcastState() {
    const stateUpdate = {
      pins: [...this.pins],
      env: { ...this.env },
    };
    this.subscribers.forEach(cb => cb(stateUpdate));
  }

  // =========================================================================
  // ✅ FIXED TRANSPILER v5 - Handles isnan, modifiers, and reserved words
  // =========================================================================
  _transpileToJS(cpp) {
    if (!cpp) return '';
    let js = cpp;
    const JS_RESERVED = ['let', 'const', 'var', 'function', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'new', 'this', 'class', 'extends', 'static', 'async', 'await', 'yield', 'int', 'float', 'char', 'double', 'long', 'byte'];

    js = js.replace(/^\s*#include\s*[<"].*?[>"]\s*$/gm, '');
    
    // ✅ Fix C++ isnan() -> JS isNaN()
    js = js.replace(/\bisnan\s*\(/g, 'isNaN(');

    js = js.replace(/^\s*#define\s+(\w+)\s+(.*?)\s*$/gm, (_, name, val) => {
      const builtins = ['HIGH', 'LOW', 'OUTPUT', 'INPUT', 'INPUT_PULLUP', 'DHT11', 'DHT22'];
      if (builtins.includes(name)) return `// #define ${name} (injected)`;
      if (JS_RESERVED.includes(name)) return `const ${name}_ = ${val};`;
      return `const ${name} = ${val};`;
    });

    js = js.replace(/\b(const|static|volatile|unsigned|signed)\s+/g, '');

    js = js.replace(/\b(int|float|double|long|bool|boolean|byte|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t|size_t|char)\s+(\w+)/g, (match, type, varName) => {
      return JS_RESERVED.includes(varName) ? `let ${varName}_` : `let ${varName}`;
    });
    
    js = js.replace(/\bString\s+(\w+)/g, (match, varName) => JS_RESERVED.includes(varName) ? `let ${varName}_` : `let ${varName}`);
    js = js.replace(/\bchar\s+(\w+)\s*\[.*?\]/g, (match, varName) => JS_RESERVED.includes(varName) ? `let ${varName}_` : `let ${varName}`);

    js = js.replace(/\bvoid\s+(\w+)\s*\(/g, 'async function $1(');
    js = js.replace(/\b(int|float|double|long|bool|boolean|byte|String)\s+(\w+)\s*\(/g, 'async function $2(');
    js = js.replace(/(?<!await\s)\bdelay\s*\(/g, 'await delay(');
    js = js.replace(/Serial\.begin\s*\(.*?\)\s*;/g, '// Serial.begin');
    js = js.replace(/for\s*\(\s*let\s+let\s+/g, 'for (let ');
    
    js = js.replace(/\(([^)]*)\)/g, (match, params) => {
      const cleaned = params.replace(/\b(let|const|var|int|float|double|bool|byte|String|char)\s+/g, '');
      return `(${cleaned})`;
    });

    const classNames = ['DHT', 'Servo', 'LiquidCrystal_I2C', 'Adafruit_NeoPixel', 'Adafruit_SSD1306', 'Adafruit_BME280', 'Adafruit_BMP280', 'DallasTemperature', 'OneWire'];
    classNames.forEach(cls => {
      const re = new RegExp(`\\b${cls}\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*;`, 'g');
      js = js.replace(re, (match, varName, args) => {
        return JS_RESERVED.includes(varName) ? `let ${varName}_ = new ${cls}(${args});` : `let ${varName} = new ${cls}(${args});`;
      });
    });

    js = js.replace(/Wire\.begin\s*\(\s*\)\s*;/g, '// Wire.begin');
    return js;
  }

  // =========================================================================
  // ✅ FIXED MOCK CLASSES - Universal Sensor Support
  // =========================================================================
  _getMockClasses(api) {
    const sim = this;

    class DHT {
      constructor(pin, type) { this.pin = pin; this.type = type; }
      begin() {}
      readTemperature(isFahrenheit = false) { 
        let t = sim.env.temperature;
        if (isFahrenheit === true) t = (t * 9.0 / 5.0) + 32.0;
        return t; 
      }
      readHumidity() { return sim.env.humidity; }
    }

    class MockServo {
      constructor() { this.pin = 0; }
      attach(p) { this.pin = p; }
      write(angle) { sim.env.servos[this.pin] = angle; sim.pins[this.pin] = angle > 0 ? 1 : 0; }
    }
    class LiquidCrystal_I2C {
      constructor(addr, c, r) {}
      init() {}
      begin() {}
      backlight() {}
      print(msg) { sim.env.lcd_text = [String(msg), '']; }
      setCursor() {}
    }
    class Adafruit_SSD1306 {
      constructor() {}
      begin() { return true; }
      display() {}
      clearDisplay() {}
      setTextSize() {}
      setTextColor() {}
      setCursor() {}
      print(msg) { sim.env.oled_text = String(msg); }
      println(msg) { sim.env.oled_text = String(msg); }
    }
    
    // ✅ DIGITAL SENSORS (BME, BMP, DS18B20) - Auto-linked to Environment
    class Adafruit_BME280 {
        begin() { return true; }
        readTemperature() { return sim.env.temperature; }
        readHumidity() { return sim.env.humidity; }
        readPressure() { return sim.env.pressure * 100; }
    }
    class OneWire { constructor(pin) { this.pin = pin; } }
    class DallasTemperature {
        constructor(oneWire) {}
        begin() {}
        requestTemperatures() {}
        getTempCByIndex(i) { return sim.env.temperature; }
        getTempFByIndex(i) { return (sim.env.temperature * 9.0 / 5.0) + 32.0; }
    }

    return { 
      DHT, Servo: MockServo, LiquidCrystal_I2C, Adafruit_SSD1306, 
      Adafruit_BME280, Adafruit_BMP280: Adafruit_BME280, 
      Adafruit_NeoPixel: class {}, 
      OneWire, DallasTemperature, Wire: {}
    };
  }

  _getArduinoAPI() {
    const sim = this;
    return {
      pinMode: (p, m) => { sim.pinModes[sim._resolvePin(p)] = m; },
      digitalWrite: (p, v) => { sim.pins[sim._resolvePin(p)] = v ? 1 : 0; },
      digitalRead: (p) => sim.pins[sim._resolvePin(p)] || 0,
      
      // ✅ SMART ANALOG READ
      analogRead: (p) => {
        const pin = sim._resolvePin(p);
        if (sim.env.potentiometers[pin] !== undefined) return sim.env.potentiometers[pin];
        return 0;
      },
      
      analogWrite: (p, v) => { sim.pins[sim._resolvePin(p)] = v > 0 ? 1 : 0; },
      delay: (ms) => new Promise(r => setTimeout(r, Math.min(ms, 200))),
      millis: () => Date.now() - sim.startTime,
      
      // ✅ FIXED SERIAL: Added printf support to prevent crashes
      Serial: { 
        print: (m) => console.log(String(m)), 
        println: (m) => console.log(String(m)), 
        printf: (...args) => console.log(...args), 
        begin: () => {} 
      },
      
      map: (x, im, iM, om, oM) => (x - im) * (oM - om) / (iM - im) + om,
      constrain: (x, a, b) => Math.max(a, Math.min(x, b)),
      tone: (p) => { sim.pins[sim._resolvePin(p)] = 1; },
      noTone: (p) => { sim.pins[sim._resolvePin(p)] = 0; }
    };
  }

  _resolvePin(pin) {
    if (typeof pin === 'string') return parseInt(pin.replace(/\D/g, ''), 10) || 0;
    return pin || 0;
  }
}