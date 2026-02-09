/**
 * src/ai/GeminiOrchestrator.js
 * Central AI Handler for Gemini 3 API
 * FIXED: Correct payload structure for Thinking Mode & Vision
 */

import { GEMINI_MODELS, THINKING_BUDGETS, validateThinkingBudget } from './GeminiConfig.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Use models from config
const MODEL_VISION = GEMINI_MODELS.VISION;
const MODEL_CODE = GEMINI_MODELS.CODE;
const MODEL_REASONING = GEMINI_MODELS.REASONING;

const MAX_RETRIES = 2; // Reduced to avoid long waits
const RETRY_DELAY = 1000;

async function withRetry(fn, retries = MAX_RETRIES) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      
      // Don't retry on client errors (4xx) or quota limits (429)
      if (err.message.includes('400') || err.message.includes('404') || err.message.includes('429')) {
        throw err;
      }
      
      if (i < retries) {
        const delay = RETRY_DELAY * Math.pow(2, i);
        console.log(`⏳ Retry ${i + 1}/${retries} after ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

export class GeminiOrchestrator {
  constructor(apiKey) {
    if (!apiKey) throw new Error('GeminiOrchestrator: API key is required.');
    this.apiKey = apiKey;
  }

  async _call(model, contents, generationConfig = {}) {
    const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        ...generationConfig,
      },
    };

    const res = await withRetry(async () => {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const detail = await r.text();
        throw new Error(`Gemini ${r.status}: ${detail}`);
      }
      return r.json();
    });

    const candidate = res.candidates?.[0]?.content?.parts?.[0];
    if (!candidate) throw new Error('Gemini returned no content.');

    return candidate.text ?? '';
  }

  _parseJSON(text) {
    try {
      // Robust JSON extraction
      let cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", text);
      return { component_type: 'UNKNOWN', reason: 'JSON Parse Error', raw: text };
    }
  }

  _shouldUseThinking(userLabel) {
    if (!userLabel || userLabel.trim().length === 0) return true;
    const vague_words = ['thing', 'part', 'component', 'device', 'sensor', 'module'];
    return vague_words.some(word => userLabel.toLowerCase().includes(word));
  }

  _getThinkingBudget(userLabel) {
    // If no label or vague label, think harder
    if (this._shouldUseThinking(userLabel)) {
        return THINKING_BUDGETS.medium; // 10k tokens
    }
    return THINKING_BUDGETS.low; // 5k tokens
  }

  // --- PUBLIC METHODS ---

  async generateContent(prompt) {
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const rawText = await this._call(MODEL_CODE, contents, { 
      temperature: 0.2, 
      responseMimeType: "text/plain"
    });
    return { text: rawText };
  }

  async generateWithThinking(prompt, thinkingBudget = 'medium') {
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const tokenBudget = validateThinkingBudget(thinkingBudget);
    
    // Config specifically for Thinking Mode
    const config = {
      temperature: 0.7,
      maxOutputTokens: 8192, // ✅ INCREASED: Prevents code cut-off
      responseMimeType: "application/json",
      thinkingConfig: {
        includeThoughts: false,
        thinkingBudget: tokenBudget
      }
    };
    
    try {
      console.log(`[GeminiOrchestrator] 🧠 Thinking... (${tokenBudget} tokens)`);
      const rawText = await this._call(MODEL_REASONING, contents, config);
      return { text: rawText };
    } catch (error) {
      console.warn('[GeminiOrchestrator] ⚠️ Thinking failed, fallback to standard:', error);
      return this.generateContent(prompt);
    }
  }

  async recognizeSketch(base64Image, userLabel = '') {
    const rawB64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const VALID_TYPES = [
      "ESP32", "LI_ION", "DC_SUPPLY", 
      "BUTTON", "SWITCH", "KEYPAD", 
      "OLED", "LCD", "SEVEN_SEG", 
      "LED", "RGB_LED", "NEOPIXEL", 
      "DC_MOTOR", "SERVO", "RELAY", "BUZZER", "SPEAKER",
      "DHT11", "DHT22", "DS18B20", "BMP280", "BME280", "LDR", "SOIL", "MQ_GAS",
      "PIR", "HC-SR04", "POTENTIOMETER", "RESISTOR"
    ];

    const prompt = `Identify this electronic component sketch.
User Label: "${userLabel || 'None'}"

Valid Types: ${VALID_TYPES.join(', ')}

Return JSON:
{
  "component_type": "TYPE_FROM_LIST",
  "confidence": "HIGH/MEDIUM/LOW",
  "properties": { "description": "brief", "visual_features": "details" }
}`;

    const contents = [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: rawB64 } },
          { text: prompt },
        ],
      },
    ];

    // Decide whether to use "Thinking" vision or "Fast" vision
    const useThinking = this._shouldUseThinking(userLabel);

    if (useThinking) {
        // COMPLEX PATH: Use Reasoning Model
        const tokenBudget = this._getThinkingBudget(userLabel);
        console.log(`[GeminiOrchestrator] 🧠 analyzing sketch with reasoning...`);
        
        try {
            const raw = await this._call(MODEL_REASONING, contents, {
                temperature: 0.4,
                thinkingConfig: { thinkingBudget: tokenBudget }
            });
            return this._parseJSON(raw);
        } catch (e) {
            console.warn("Thinking vision failed, falling back to standard vision");
        }
    }

    // FAST PATH: Standard Vision Model
    console.log(`[GeminiOrchestrator] 👁️ analyzing sketch (fast)...`);
    const raw = await this._call(MODEL_VISION, contents, { 
      temperature: 0.4 
    });
    return this._parseJSON(raw);
  }
}

// Singleton helper
let _instance = null;
export function getOrchestrator(apiKey) {
  if (!_instance && apiKey) {
    _instance = new GeminiOrchestrator(apiKey);
  }
  return _instance;
}