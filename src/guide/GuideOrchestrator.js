/**
 * src/guide/GuideOrchestrator.js
 * Intelligent timing and context management for AI guidance
 * IMPROVED: Solves "Context Blindness" by mapping wire connections
 * OPTIMIZED: Disabled idle suggestions to save API quota
 */

import { GeminiGuideService } from './GeminiGuideService.js';

export class GuideOrchestrator {
  constructor(circuitState, validator, apiKey) {
    this.circuit = circuitState;
    this.validator = validator;
    this.gemini = new GeminiGuideService(apiKey);
    
    this.enabled = true;
    this.listeners = {};
    
    this.adviceCache = new Map();
    this.errorTimer = null;
    this.lastComponentAdded = null;
    
    this._setupListeners();
  }

  _setupListeners() {
    if (this.validator) {
      this.validator.on('error', (err) => {
        if (!this.enabled) return;
        
        if (this.errorTimer) clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(() => this._handleError(err), 2000);
      });

      this.validator.on('success', (data) => {
        if (!this.enabled) return;
        this._emit('ai:guidance', {
          trigger: 'TIP',
          guidance: {
            title: "Connection Verified ✓",
            message: `GPIO ${data.pin} is compatible with ${data.component_type}. Great choice!`
          },
          priority: 'low'
        });
      });
    }

    document.addEventListener('component:added', (e) => {
      this.lastComponentAdded = e.detail;
      
      const tips = {
        'OLED': 'I2C displays like OLED use GPIO 21 (SDA) and 22 (SCL). These pins work together!',
        'LCD': 'This LCD uses I2C protocol. Connect SDA→GPIO21, SCL→GPIO22.',
        'DHT22': 'DHT22 is digital! Avoid boot-sensitive pins (0, 2, 12, 15).',
        'SERVO': 'Servos need PWM. GPIO 4, 16, 17, 18, 19 are solid choices.',
        'BME280': 'BME280 shares I2C pins with OLED/LCD. You can connect multiple devices to the same pins!',
        'POTENTIOMETER': 'Potentiometers need ADC pins. Use GPIO 32-39 (ADC1) to avoid WiFi conflicts.'
      };

      if (tips[e.detail.type]) {
        this._emit('ai:guidance', {
          trigger: 'TIP',
          guidance: {
            title: `${e.detail.label} Added`,
            message: tips[e.detail.type]
          },
          priority: 'low'
        });
      }
    });
  }

  async _handleError(errorData) {
    const cacheKey = `ERR:${errorData.component_id}:${errorData.result?.error}`;
    const now = Date.now();
    
    if (this.adviceCache.has(cacheKey)) {
        if (now - this.adviceCache.get(cacheKey) < 120000) return;
    }

    console.log("🤖 AI Guide analyzing error:", errorData);
    this._emit('ai:status', { status: 'thinking' });

    const simpleCircuit = this._simplifyCircuit();
    
    try {
        const advice = await this.gemini.explainError(simpleCircuit, errorData);
        
        if (advice && advice.message) {
          this.adviceCache.set(cacheKey, now);
          
          this._emit('ai:guidance', {
            trigger: 'VALIDATION_ERROR',
            guidance: advice,
            priority: 'high'
          });
        }
    } catch (e) {
        console.error("AI Error Explain failed", e);
    } finally {
        this._emit('ai:status', { status: 'idle' });
    }
  }

  async suggestNextStep() {
    console.log("🤖 User requested help...");
    this._emit('ai:status', { status: 'thinking' });

    try {
        const simpleCircuit = this._simplifyCircuit();
        const suggestion = await this.gemini.suggestNextStep(simpleCircuit);
        
        if (suggestion) {
          this._emit('ai:guidance', {
            trigger: 'MANUAL_ASK',
            guidance: {
                title: "What's Next?",
                message: suggestion.message,
                action: suggestion.action_label,
                learningGoal: suggestion.learning_goal
            },
            priority: 'medium'
          });
        }
    } catch (e) {
        console.error("AI Suggestion failed", e);
    } finally {
        this._emit('ai:status', { status: 'idle' });
    }
  }

  // ✅ DISABLED: Idle suggestions (saves API quota during demo)
  async _triggerIdleSuggestion() {
    console.log('[GuideOrchestrator] 💤 Idle suggestions disabled to save API quota');
    return;
  }

  async requestWiringGuide() {
    if (!this.lastComponentAdded) return;

    this._emit('ai:status', { status: 'thinking' });

    try {
      const availablePins = this._getAvailablePins();
      const guide = await this.gemini.generateWiringGuide(
        this.lastComponentAdded.type,
        availablePins
      );

      if (guide) {
        this._emit('ai:guidance', {
          trigger: 'MANUAL_ASK',
          guidance: {
            title: `How to Wire ${this.lastComponentAdded.label}`,
            message: guide.steps.map(s => `${s.step}. ${s.instruction}`).join('\n'),
            wiringSteps: guide.steps,
            testingTip: guide.testing_tip
          },
          priority: 'high'
        });
      }
    } catch (e) {
      console.error("Wiring guide failed", e);
    } finally {
      this._emit('ai:status', { status: 'idle' });
    }
  }

  /**
   * ✅ CRITICAL FIX: NOW INCLUDES WIRE CONNECTIONS
   * This maps wires to components so Gemini sees the whole picture.
   */
  _simplifyCircuit() {
    if (!this.circuit || !this.circuit.components) return { components: [], wires: [] };

    const wireMap = [];
    if (this.circuit.wires) {
        this.circuit.wires.forEach(wire => {
            const fromId = wire.sourceComponentId || wire.from?.component;
            const fromPin = wire.sourcePin || wire.from?.pin;
            const toId = wire.targetComponentId || wire.to?.component;
            const toPin = wire.targetPin || wire.to?.pin;

            if (fromId && toId) {
                wireMap.push({
                    from: `${fromId}:${fromPin}`,
                    to: `${toId}:${toPin}`
                });
            }
        });
    }

    const simplifiedComponents = this.circuit.components.map(c => {
      const connectedWires = wireMap.filter(w => 
        w.from.startsWith(c.id) || w.to.startsWith(c.id)
      );

      return {
        id: c.id,
        type: c.type,
        label: c.label || c.type,
        connections: connectedWires
      };
    });

    return {
      components: simplifiedComponents,
      totalComponents: simplifiedComponents.length,
      wireCount: wireMap.length
    };
  }

  _getAvailablePins() {
    const usedPins = new Set();
    if (this.circuit && this.circuit.wires) {
      this.circuit.wires.forEach(wire => {
        const fromPin = wire.sourcePin || wire.from?.pin;
        const toPin = wire.targetPin || wire.to?.pin;
        if (toPin) usedPins.add(toPin);
        if (fromPin) usedPins.add(fromPin);
      });
    }

    const safePins = ['4', '5', '16', '17', '18', '19', '21', '22', '23', '25', '26', '27', '32', '33'];
    return safePins.filter(pin => !usedPins.has(pin));
  }

  // ✅ DISABLED: No longer triggers idle suggestions
  _resetIdleTimer() {
    // Disabled to prevent unnecessary API calls during demo
    return;
  }

  notifyCircuitEvent(event, data) {
    if (event === 'circuit:updated') {
      this.circuit = data;
      // ✅ No longer calls _resetIdleTimer()
    }
  }

  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  _emit(event, data) {
    const domEvent = new CustomEvent(event, { detail: data });
    document.dispatchEvent(domEvent);

    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}