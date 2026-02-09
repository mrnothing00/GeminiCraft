/**
 * SketchRecognizer.js - FIXED VERSION v2
 * 
 * CRITICAL FIX: The freehand strokes are SVG <path> elements, NOT drawn on 
 * the <canvas>. So `captureRegion()` was always capturing a blank image.
 * 
 * Fix: We now render the SVG sketch strokes onto an offscreen canvas before 
 * capturing, giving Gemini actual visual data to analyze.
 * 
 * Additional fixes:
 * - Better component positioning (center of sketch)
 * - Fallback to LED if AI returns UNKNOWN
 * - Label-only recognition (no drawing needed if label is clear)
 */

import { getOrchestrator } from './GeminiOrchestrator.js';

// --- Component Library (Fast-Path) ---
const KNOWN_COMPONENT_MAP = {
  'esp32': 'ESP32', 'esp-32': 'ESP32',
  'battery': 'LI_ION', 'li-ion': 'LI_ION',
  'power supply': 'DC_SUPPLY', 'dc supply': 'DC_SUPPLY',
  'button': 'BUTTON', 'push button': 'BUTTON',
  'switch': 'SWITCH', 'keypad': 'KEYPAD',
  'oled': 'OLED', 'lcd': 'LCD',
  '7 segment': 'SEVEN_SEG', 'seven segment': 'SEVEN_SEG',
  'led': 'LED', 'rgb led': 'RGB_LED', 'neopixel': 'NEOPIXEL',
  'dc motor': 'DC_MOTOR', 'motor': 'DC_MOTOR',
  'servo': 'SERVO', 'servo motor': 'SERVO',
  'relay': 'RELAY', 'buzzer': 'BUZZER', 'speaker': 'SPEAKER',
  'dht11': 'DHT11', 'dht22': 'DHT22', 'ds18b20': 'DS18B20',
  'bme280': 'BME280', 'bmp280': 'BMP280',
  'ldr': 'LDR', 'photoresistor': 'LDR', 'light sensor': 'LDR',
  'soil moisture': 'SOIL', 'soil': 'SOIL',
  'gas sensor': 'MQ_GAS', 'mq': 'MQ_GAS',
  'temperature sensor': 'DHT22', 'temp sensor': 'DHT22',
  'humidity sensor': 'DHT22',
  'pir': 'PIR', 'motion sensor': 'PIR',
  'ultrasonic': 'HC-SR04', 'hc-sr04': 'HC-SR04', 'distance': 'HC-SR04',
  'potentiometer': 'POTENTIOMETER', 'pot': 'POTENTIOMETER',
  'resistor': 'RESISTOR',
  'fan': 'DC_MOTOR',
  'pump': 'DC_MOTOR',
  'water pump': 'DC_MOTOR',
  'heater': 'RELAY',
  'lamp': 'RELAY',
  'thermometer': 'DHT22',
  'thermostat': 'DHT22',
  'joystick': 'POTENTIOMETER',
  'ir sensor': 'PIR',
  'ir': 'PIR',
};

const GENERIC_TERMS = [
  'thing', 'part', 'component', 'device', 'object', 'item', 'stuff',
  'sensor', 'light', 'display', 'input', 'output',
  'temp', 'temperature', 'humidity', 'pressure'
];

const REQUIREMENTS_MAP = {
  DC_MOTOR: 'PWM', LED: 'PWM', SERVO: 'PWM',
  I2C_LCD: 'I2C', LCD: 'I2C', OLED: 'I2C',
  SENSOR: 'INPUT', DHT11: 'INPUT', DHT22: 'INPUT',
  DS18B20: 'INPUT', PIR: 'INPUT',
  BUTTON: 'INPUT', SWITCH: 'INPUT',
  POTENTIOMETER: 'ADC_INPUT', LDR: 'ADC_INPUT',
  SOIL: 'ADC_INPUT', NTC: 'ADC_INPUT',
  RELAY: 'OUTPUT', RESISTOR: 'PASSIVE',
  RGB_LED: 'PWM', NEOPIXEL: 'OUTPUT',
  BUZZER: 'OUTPUT', SPEAKER: 'PWM',
  KEYPAD: 'INPUT', SEVEN_SEG: 'OUTPUT',
  BME280: 'I2C', BMP280: 'I2C', BH1750: 'I2C',
  'HC-SR04': 'INPUT', 'HC-SR501': 'INPUT',
  MQ_GAS: 'ADC_INPUT', 'MH_Z19': 'INPUT',
  LI_ION: 'POWER', DC_SUPPLY: 'POWER',
  ESP32: 'MCU',
  UNKNOWN: 'OUTPUT',
};

let _idCounter = 0;
function genId() {
  return `comp_${String(++_idCounter).padStart(3, '0')}_${Date.now().toString(36)}`;
}

export class SketchRecognizer {
  /**
   * @param {HTMLCanvasElement} canvas - The hidden canvas element (used as backup)
   * @param {GeminiOrchestrator} orchestrator - AI service
   */
  constructor(canvas, orchestrator) {
    if (!canvas) throw new Error('SketchRecognizer: canvas element is required.');
    this.canvas = canvas;
    this.orchestrator = orchestrator || getOrchestrator();
  }

  /**
   * ✅ FIXED: Capture sketch strokes from SVG, not from the empty <canvas>.
   * 
   * Strategy: Find the SVG overlay that contains the sketch paths,
   * serialize it to an image, and draw it onto an offscreen canvas.
   */
  async captureRegion(x, y, width, height) {
    // Ensure minimum dimensions
    width = Math.max(width, 50);
    height = Math.max(height, 50);

    // 1. Try to find sketch SVG paths in the DOM
    const sketchSvg = this._buildSketchSVG(x, y, width, height);
    
    if (sketchSvg) {
      // Convert SVG to base64 image
      try {
        const base64 = await this._svgToBase64(sketchSvg, width, height);
        console.log('[SketchRecognizer] ✅ Captured SVG strokes as image');
        return base64;
      } catch (err) {
        console.warn('[SketchRecognizer] SVG capture failed, using fallback:', err);
      }
    }

    // 2. Fallback: Try reading from the actual canvas element
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      
      // Fill with dark background so Gemini can see contrast
      offCtx.fillStyle = '#0d0d1a';
      offCtx.fillRect(0, 0, width, height);
      
      // Try to draw from source canvas
      offCtx.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
      
      return offscreen.toDataURL('image/png');
    } catch (err) {
      console.warn('[SketchRecognizer] Canvas capture also failed:', err);
      // Return a minimal placeholder
      return this._createPlaceholderImage(width, height);
    }
  }

  /**
   * Build an SVG string from the sketch path elements in the DOM
   */
  _buildSketchSVG(regionX, regionY, width, height) {
    // Find all sketch path elements (the visible orange strokes)
    const sketchPaths = document.querySelectorAll('svg path[stroke="#ff9f43"], svg path[stroke="#ffeb3b"]');
    
    if (sketchPaths.length === 0) {
      console.log('[SketchRecognizer] No sketch paths found in DOM');
      return null;
    }

    // Build a standalone SVG with just the strokes, translated to region coordinates
    const pathElements = Array.from(sketchPaths).map(path => {
      const d = path.getAttribute('d');
      if (!d) return '';
      return `<path d="${d}" fill="none" stroke="#ff9f43" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${regionX} ${regionY} ${width} ${height}">
      <rect width="100%" height="100%" fill="#0d0d1a"/>
      ${pathElements}
    </svg>`;
  }

  /**
   * Convert SVG string → base64 PNG via offscreen canvas
   */
  _svgToBase64(svgString, width, height) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const ctx = offscreen.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(offscreen.toDataURL('image/png'));
      };
      
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      
      img.src = url;
    });
  }

  /**
   * Create a placeholder image with text when all capture methods fail
   */
  _createPlaceholderImage(width, height) {
    const offscreen = document.createElement('canvas');
    offscreen.width = Math.max(width, 100);
    offscreen.height = Math.max(height, 100);
    const ctx = offscreen.getContext('2d');
    
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    ctx.fillStyle = '#ff9f43';
    ctx.font = '14px monospace';
    ctx.fillText('(sketch region)', 10, 30);
    
    return offscreen.toDataURL('image/png');
  }

  _isGenericTerm(label) {
    const lower = label.toLowerCase().trim();
    return GENERIC_TERMS.some(term => lower === term || lower.includes(term));
  }

  async recognizeRegion(x, y, width, height, userLabel = '') {
    console.log(`[SketchRecognizer] 🎨 Recognizing at (${x}, ${y}) size ${width}x${height}`);
    console.log(`[SketchRecognizer] 📝 Label: "${userLabel}"`);
    
    const centerX = Math.round(x + width / 2);
    const centerY = Math.round(y + height / 2);
    
    const cleanLabel = (userLabel || '').trim().toLowerCase();
    
    // 1. Skip AI entirely for generic terms — use label matching
    if (this._isGenericTerm(cleanLabel)) {
      console.log(`[SketchRecognizer] Generic term detected - trying partial match first`);
      const fallback = this._fallbackFromLabel(userLabel);
      if (fallback.confidence !== 'LOW') {
        return this._createComponent(fallback.component_type, centerX, centerY, userLabel, fallback.properties, fallback);
      }
      // If even partial match fails, use AI
      return await this._aiRecognition(centerX, centerY, width, height, userLabel);
    }
    
    // 2. Fast-path: Exact match
    if (KNOWN_COMPONENT_MAP[cleanLabel]) {
      const matchedType = KNOWN_COMPONENT_MAP[cleanLabel];
      console.log(`[SketchRecognizer] ✅ Fast-match: "${userLabel}" → ${matchedType}`);
      
      return this._createComponent(matchedType, centerX, centerY, userLabel, {
        description: `User sketch: ${userLabel}`,
        visual_features: 'Matched from library',
        label_interpretation: 'Exact match in component database'
      });
    }

    // 3. Try partial match before burning an API call
    const partialMatch = this._fallbackFromLabel(userLabel);
    if (partialMatch.confidence === 'HIGH' || partialMatch.confidence === 'MEDIUM') {
      console.log(`[SketchRecognizer] ✅ Partial match: "${userLabel}" → ${partialMatch.component_type}`);
      return this._createComponent(partialMatch.component_type, centerX, centerY, userLabel, partialMatch.properties, partialMatch);
    }

    // 4. No match - use AI
    console.log(`[SketchRecognizer] 🤖 No match - using AI vision`);
    return await this._aiRecognition(centerX, centerY, width, height, userLabel);
  }

  async _aiRecognition(centerX, centerY, width, height, userLabel) {
    // ✅ FIXED: Use the new async captureRegion
    const base64Image = await this.captureRegion(
      centerX - width / 2,
      centerY - height / 2,
      Math.max(width, 50),
      Math.max(height, 50)
    );
    
    let spec;
    try {
      spec = await this.orchestrator.recognizeSketch(base64Image, userLabel);
      
      console.log(`[SketchRecognizer] AI Result:`, spec.component_type, 
        `(${spec.confidence} confidence)`);
      
    } catch (err) {
      console.error('[SketchRecognizer] AI failed:', err);
      spec = this._fallbackFromLabel(userLabel);
    }

    return this._createComponent(
      spec.component_type,
      centerX,
      centerY,
      userLabel,
      spec.properties,
      spec
    );
  }

  _createComponent(type, x, y, userLabel, properties, fullSpec = {}) {
    let componentType = (type || 'UNKNOWN').toUpperCase();
    
    // Default to LED if UNKNOWN
    if (componentType === 'UNKNOWN') {
      console.warn(`[SketchRecognizer] Unknown type - defaulting to LED for "${userLabel}"`);
      componentType = 'LED';
    }
    
    // Validate type exists in requirements map
    if (!REQUIREMENTS_MAP[componentType]) {
      console.warn(`[SketchRecognizer] Unrecognized type ${componentType}, using LED`);
      componentType = 'LED';
    }

    // Determine palette metadata for color/icon
    let color = '#ffffff';
    let icon = '📦';
    
    const TYPE_DISPLAY = {
      ESP32: { color: '#3a86ff', icon: '🧠' },
      LED: { color: '#ff7675', icon: '💡' }, RGB_LED: { color: '#ff7675', icon: '🎨' },
      NEOPIXEL: { color: '#ff7675', icon: '🌈' },
      DC_MOTOR: { color: '#ff7675', icon: '💨' }, SERVO: { color: '#ff7675', icon: '🦾' },
      RELAY: { color: '#ff7675', icon: '🔌' }, BUZZER: { color: '#ff7675', icon: '🔔' },
      DHT11: { color: '#00b894', icon: '🌡️' }, DHT22: { color: '#00b894', icon: '🌡️' },
      DS18B20: { color: '#00b894', icon: '🌡️' }, BME280: { color: '#00b894', icon: '☁️' },
      BMP280: { color: '#00b894', icon: '☁️' }, LDR: { color: '#00b894', icon: '☀️' },
      BH1750: { color: '#00b894', icon: '💡' }, NTC: { color: '#00b894', icon: '🌡️' },
      POTENTIOMETER: { color: '#00b894', icon: '🎛️' },
      OLED: { color: '#6c5ce7', icon: '📟' }, LCD: { color: '#6c5ce7', icon: '📺' },
      SEVEN_SEG: { color: '#6c5ce7', icon: '8️⃣' },
      BUTTON: { color: '#fab1a0', icon: '🔘' }, SWITCH: { color: '#fab1a0', icon: '🔛' },
      KEYPAD: { color: '#fab1a0', icon: '⌨️' },
      LI_ION: { color: '#ffeaa7', icon: '🔋' }, DC_SUPPLY: { color: '#ffeaa7', icon: '⚡' },
    };
    
    const display = TYPE_DISPLAY[componentType] || { color: '#ffffff', icon: '📦' };

    const component = {
      id: genId(),
      type: componentType,
      label: userLabel || properties?.description || componentType,
      position: { x, y },
      connectedPin: null,
      color: display.color,
      icon: display.icon,
      properties: properties || {},
      
      pinRoles: fullSpec.suggested_pin_roles || [],
      suggestedPins: [],
      
      powerRequirements: fullSpec.power_requirements || 'Standard',
      requirements: REQUIREMENTS_MAP[componentType] || 'OUTPUT',
      
      aiConfidence: fullSpec.confidence || 'MEDIUM',
      aiAlternatives: fullSpec.alternative_interpretations || [],
    };
    
    console.log(`[SketchRecognizer] ✅ Created: ${componentType} "${component.label}" at (${x}, ${y})`);
    return component;
  }

  _fallbackFromLabel(label) {
    const normalized = (label || '').toLowerCase().trim();
    
    // Try partial matches
    for (const [key, type] of Object.entries(KNOWN_COMPONENT_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return {
          component_type: type,
          suggested_pin_roles: [],
          power_requirements: 'Standard',
          properties: {
            description: `Sketch: ${label}`,
            visual_features: 'Fallback partial match',
            label_interpretation: `Matched keyword "${key}"`
          },
          confidence: 'MEDIUM'
        };
      }
    }
    
    return {
      component_type: 'LED',
      suggested_pin_roles: [],
      power_requirements: 'Standard',
      properties: {
        description: `Unknown component "${label}" (defaulted to LED)`,
        visual_features: 'Recognition failed - using default',
        label_interpretation: 'Could not determine type'
      },
      confidence: 'LOW'
    };
  }
}
