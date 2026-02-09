/**
 * src/codegen/CodeGenerator.js
 * Generates Arduino C++ code from visual circuit using Gemini 3
 * FIX: Requests JSON output to prevent formatting issues and adds robust parsing.
 */

const SUPPORTED_LIBRARIES = [
  'DHT.h (DHT11/DHT22 sensors)',
  'Adafruit_NeoPixel.h (Addressable LEDs)',
  'LiquidCrystal_I2C.h (I2C LCD displays)',
  'Adafruit_SSD1306.h (OLED displays)',
  'Adafruit_GFX.h (Graphics library)',
  'Servo.h (Servo motors)',
  'Wire.h (I2C communication)',
  'SPI.h (SPI communication)',
  'OneWire.h (DS18B20 temperature)',
  'DallasTemperature.h (DS18B20 library)',
  'Adafruit_BME280.h (BME280 sensor)',
  'Adafruit_BMP280.h (BMP280 sensor)'
];

const COMPONENT_LIBRARY_MAP = {
  'DHT11': ['DHT.h'],
  'DHT22': ['DHT.h'],
  'DS18B20': ['OneWire.h', 'DallasTemperature.h'],
  'BME280': ['Wire.h', 'Adafruit_BME280.h', 'Adafruit_Sensor.h'],
  'BMP280': ['Wire.h', 'Adafruit_BMP280.h', 'Adafruit_Sensor.h'],
  'OLED': ['Wire.h', 'Adafruit_SSD1306.h', 'Adafruit_GFX.h'],
  'LCD': ['Wire.h', 'LiquidCrystal_I2C.h'],
  'NEOPIXEL': ['Adafruit_NeoPixel.h'],
  'SERVO': ['Servo.h'],
  'RGB_LED': []
};

export class CodeGenerator {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.pinMap = {};
    this.componentCategories = { inputs: [], outputs: [], displays: [], sensors: [] };
  }

  async generate(circuitState, userIntent = "") {
    this.pinMap = {};
    this.componentCategories = { inputs: [], outputs: [], displays: [], sensors: [] };
    
    // 1. Robustly map all connections first
    this._mapConnections(circuitState.components, circuitState.wires);
    
    const activeComponents = circuitState.components.filter(c => c.type !== 'ESP32');
    
    // 2. If no components, return blink demo
    if (activeComponents.length === 0) {
      return this._generateBlinkFallback();
    }

    this._categorizeComponents(activeComponents);
    
    const systemPrompt = this._createSystemPrompt(activeComponents, userIntent);

    try {
      if (!this.orchestrator) throw new Error("No AI Orchestrator");

      const thinkingLevel = this._determineThinkingLevel(activeComponents, userIntent);
      
      console.log(`[CodeGen] Using ${thinkingLevel} thinking for ${activeComponents.length} components`);

      const response = await this.orchestrator.generateWithThinking(
        systemPrompt,
        thinkingLevel
      );

      // ✅ FIX: Parse the JSON response to get clean code
      return this._parseAndClean(response.text);

    } catch (error) {
      console.error("AI Code Generation Failed:", error);
      // 3. Fallback to static generation if AI fails
      return `/* AI Generation Failed: ${error.message} - Using Static Fallback */\n` +
        this._generateStaticFallback(activeComponents);
    }
  }

  /**
   * ✅ NEW: robustly extracts code from JSON response
   */
  _parseAndClean(text) {
    try {
      // 1. Try to parse as JSON first (The AI is instructed to return JSON)
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      
      // Find JSON object bounds
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonStr = cleanJson.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed.code) {
          return parsed.code; // ✅ Success: Clean code from JSON
        }
      }
    } catch (e) {
      console.warn("JSON parse failed for code, falling back to regex cleaning", e);
    }

    // 2. Fallback: Formatting cleanup if JSON fails
    let cleaned = text.replace(/\\n/g, '\n').replace(/\\"/g, '"'); // Unescape if it looks like a string dump
    cleaned = cleaned.replace(/```(?:cpp|c|arduino|ino)?\n?/g, '').trim();
    cleaned = cleaned.replace(/^(Here is|Here's|Below is|This is).*?code.*?:/gim, '');
    
    const codeStart = cleaned.search(/#include|\/\*|void\s+setup/);
    if (codeStart > 0) {
      cleaned = cleaned.substring(codeStart);
    }
    
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < cleaned.length - 10) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }
    
    return cleaned.trim();
  }

  _determineThinkingLevel(components, userIntent) {
    const connectedCount = components.filter(c => {
      const pins = this.pinMap[c.id];
      return pins && Object.keys(pins).length > 0;
    }).length;

    if (userIntent && userIntent.length > 20) return 'high';
    if (connectedCount >= 4) return 'high';
    if (connectedCount >= 2) return 'medium';
    return 'low';
  }

  _categorizeComponents(components) {
    components.forEach(comp => {
      const pins = this.pinMap[comp.id];
      // Only categorize if it's actually connected
      if (!pins || Object.keys(pins).length === 0) return;

      if (['DHT11', 'DHT22', 'DS18B20', 'BME280', 'BMP280', 'LDR', 'BH1750', 'SOIL', 'POTENTIOMETER', 'NTC'].includes(comp.type)) {
        this.componentCategories.sensors.push(comp);
      } else if (['BUTTON', 'SWITCH', 'KEYPAD', 'PIR'].includes(comp.type)) {
        this.componentCategories.inputs.push(comp);
      } else if (['OLED', 'LCD', 'SEVEN_SEG'].includes(comp.type)) {
        this.componentCategories.displays.push(comp);
      } else if (['LED', 'RGB_LED', 'NEOPIXEL', 'RELAY', 'DC_MOTOR', 'SERVO', 'BUZZER', 'SPEAKER'].includes(comp.type)) {
        this.componentCategories.outputs.push(comp);
      }
    });
  }

  _mapConnections(components, wires) {
    if (!wires || !Array.isArray(wires)) return;

    wires.forEach(wire => {
      const sourceId = wire.sourceComponentId || wire.from?.component || wire.source;
      const targetId = wire.targetComponentId || wire.to?.component || wire.target;
      
      const sourcePin = wire.sourcePin || wire.from?.pin || wire.sourceHandle;
      const targetPin = wire.targetPin || wire.to?.pin || wire.targetHandle;

      const fromComp = components.find(c => c.id === sourceId);
      const toComp = components.find(c => c.id === targetId);

      if (!fromComp || !toComp) return;

      let espPinRaw = null;
      let targetComp = null;
      let targetPinLabel = null;

      if (fromComp.type === 'ESP32') {
        espPinRaw = sourcePin;
        targetComp = toComp;
        targetPinLabel = targetPin;
      } else if (toComp.type === 'ESP32') {
        espPinRaw = targetPin;
        targetComp = fromComp;
        targetPinLabel = sourcePin;
      }

      if (espPinRaw && targetComp) {
        if (!this.pinMap[targetComp.id]) this.pinMap[targetComp.id] = {};
        const cleanEspPin = String(espPinRaw).replace(/^(GPIO_|PIN_|P|GPIO)/i, '').trim();
        this.pinMap[targetComp.id][targetPinLabel] = cleanEspPin;
      }
    });
  }

  _createSystemPrompt(components, userIntent) {
    const hardwareList = components.map(c => {
      const pins = this.pinMap[c.id];
      if (!pins || Object.keys(pins).length === 0) return null;

      const pinStr = Object.entries(pins)
        .map(([role, gpio]) => `${role} → GPIO ${gpio}`)
        .join(', ');

      const requiredLibs = COMPONENT_LIBRARY_MAP[c.type] || [];
      const libStr = requiredLibs.length > 0 ? `\n  Required Libraries: ${requiredLibs.join(', ')}` : '';

      return `- ${c.type} (Label: "${c.label}")\n  Connections: ${pinStr}${libStr}`;
    }).filter(Boolean).join('\n\n');

    const { inputs, outputs, displays, sensors } = this.componentCategories;

    const circuitAnalysis = `
CIRCUIT ANALYSIS:
- Sensors: ${sensors.map(s => s.type).join(', ') || 'None'}
- Inputs: ${inputs.map(i => i.type).join(', ') || 'None'}
- Outputs: ${outputs.map(o => o.type).join(', ') || 'None'}
- Displays: ${displays.map(d => d.type).join(', ') || 'None'}
`;

    const goal = userIntent
      ? `USER'S PROJECT GOAL:\n"${userIntent}"\n\nImplement code that achieves this specific goal.`
      : `GOAL: Create a functional demo where components interact logically.`;

    return `You are an expert ESP32 firmware engineer.

${circuitAnalysis}

HARDWARE INVENTORY:
${hardwareList || "No components connected."}

${goal}

AVAILABLE LIBRARIES:
${SUPPORTED_LIBRARIES.map(lib => `- ${lib}`).join('\n')}

**CRITICAL INSTRUCTION - JSON OUTPUT ONLY**
You MUST return a valid JSON object containing the complete Arduino C++ code in a single string field named "code".
Do NOT return Markdown. Do NOT return explanation text outside the JSON.

**JSON SCHEMA:**
{
  "code": "#include <Arduino.h>\\n\\n//..."
}

**CODE GUIDELINES:**
1. **PIN ACCURACY**: Use the exact GPIO pins listed above.
2. **NON-BLOCKING**: Use millis() instead of delay().
3. **LOGIC**: Implement sensor-driven automation (e.g., if temp > X, turn LED on).
4. **ERROR HANDLING**: Check for valid sensor readings.

Now generate the JSON response.`;
  }

  _generateBlinkFallback() {
    return `/*
 * ESP32 Basic Blink
 * No components connected yet - add some from the sidebar!
 */
#include <Arduino.h>
const int LED_PIN = 2;
void setup() {
  Serial.begin(115200);
  Serial.println("\\n=== ESP32 System Ready ===");
  pinMode(LED_PIN, OUTPUT);
}
void loop() {
  static unsigned long lastBlink = 0;
  if (millis() - lastBlink >= 1000) {
    lastBlink = millis();
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    Serial.print(".");
  }
}`;
  }

  _generateStaticFallback(components) {
    let includes = new Set(['#include <Arduino.h>']);
    let defines = [];
    let globals = [];
    let setup = ['Serial.begin(115200);'];
    let loop = [];

    const devices = components.filter(c => c.type !== 'ESP32');
    if (devices.length === 0) {
        loop.push('Serial.println("No components connected"); delay(1000);');
    }

    const hasI2C = devices.some(d => ['OLED', 'LCD', 'BME280', 'BMP280'].includes(d.type));
    if (hasI2C) {
      includes.add('#include <Wire.h>');
      setup.push('Wire.begin();');
    }

    devices.forEach(comp => {
      const safeName = comp.label.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
      const pins = this.pinMap[comp.id];
      if (!pins || Object.keys(pins).length === 0) return;

      if (['LED', 'RELAY', 'DC_MOTOR', 'BUZZER'].includes(comp.type)) {
        const pin = Object.values(pins).find(p => !isNaN(p));
        if (pin) {
          defines.push(`#define PIN_${safeName} ${pin}`);
          setup.push(`pinMode(PIN_${safeName}, OUTPUT);`);
          loop.push(`digitalWrite(PIN_${safeName}, HIGH); delay(500); digitalWrite(PIN_${safeName}, LOW); delay(500);`);
        }
      }
      
      if (comp.type === 'SERVO') {
        const pin = Object.values(pins).find(p => !isNaN(p));
        if (pin) {
          includes.add('#include <Servo.h>');
          defines.push(`#define PIN_${safeName} ${pin}`);
          globals.push(`Servo servo_${safeName};`);
          setup.push(`servo_${safeName}.attach(PIN_${safeName});`);
          loop.push(`servo_${safeName}.write(0); delay(500);`);
          loop.push(`servo_${safeName}.write(90); delay(500);`);
          loop.push(`servo_${safeName}.write(180); delay(500);`);
        }
      }

      if (['DHT11', 'DHT22'].includes(comp.type)) {
        const pin = pins['DATA'] || pins['SIGNAL'] || Object.values(pins).find(p => !isNaN(p));
        if (pin) {
          includes.add('#include <DHT.h>');
          defines.push(`#define DHTPIN_${safeName} ${pin}`);
          defines.push(`#define DHTTYPE_${safeName} ${comp.type}`);
          globals.push(`DHT dht_${safeName}(DHTPIN_${safeName}, DHTTYPE_${safeName});`);
          setup.push(`dht_${safeName}.begin();`);
          loop.push(`float temp_${safeName} = dht_${safeName}.readTemperature();`);
          loop.push(`float hum_${safeName} = dht_${safeName}.readHumidity();`);
          loop.push(`if (!isnan(temp_${safeName})) {`);
          loop.push(`  Serial.print("${comp.label} - Temp: "); Serial.print(temp_${safeName});`);
          loop.push(`  Serial.print("°C, Humidity: "); Serial.print(hum_${safeName}); Serial.println("%");`);
          loop.push(`}`);
        }
      }

      if (comp.type === 'BUTTON') {
        const pin = Object.values(pins).find(p => !isNaN(p));
        if (pin) {
          defines.push(`#define PIN_${safeName} ${pin}`);
          setup.push(`pinMode(PIN_${safeName}, INPUT_PULLUP);`);
          loop.push(`if (digitalRead(PIN_${safeName}) == LOW) {`);
          loop.push(`  Serial.println("${comp.label} pressed!");`);
          loop.push(`  delay(50); // Debounce`);
          loop.push(`}`);
        }
      }

      if (comp.type === 'POTENTIOMETER') {
        const pin = pins['SIGNAL'] || pins['OUT'] || Object.values(pins).find(p => !isNaN(p));
        if (pin) {
          defines.push(`#define PIN_${safeName} ${pin}`);
          loop.push(`int pot_${safeName} = analogRead(PIN_${safeName});`);
          loop.push(`Serial.print("${comp.label}: "); Serial.println(pot_${safeName});`);
        }
      }
    });

    if (loop.length === 0) {
      loop.push('Serial.println("Components placed but logic not generated");');
      loop.push('delay(1000);');
    } else {
      loop.push('');
      loop.push('delay(100); // System tick');
    }

    return `/* STATIC FALLBACK CODE (AI Offline) */\n${Array.from(includes).join('\n')}\n${defines.join('\n')}\n${globals.join('\n')}\nvoid setup() {\n  ${setup.join('\n  ')}\n}\nvoid loop() {\n  ${loop.join('\n  ')}\n}`;
  }
}