/**
 * src/guide/GeminiGuideService.js
 * AI-powered circuit building guidance using Gemini 3
 * IMPROVED: Enhanced prompts, thinking mode, better educational context
 * FIXED: thinking_budget now uses integer tokens instead of strings
 */

export class GeminiGuideService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    
    // ✅ UPDATED: Use Gemini 3 models
    this.primaryModel  = "gemini-3-flash-preview"; 
    this.fallbackModel = "gemini-2.0-flash-exp";
    
    this.activeModel = this.primaryModel;
  }

  async callGemini(prompt, options = {}) {
    try {
      return await this._executeRequest(this.activeModel, prompt, options);
    } catch (error) {
      if ((error.message.includes('404') || error.message.includes('503')) && this.activeModel === this.primaryModel) {
        console.warn(`⚠️ ${this.primaryModel} failed. Switching to ${this.fallbackModel}...`);
        this.activeModel = this.fallbackModel;
        return await this._executeRequest(this.activeModel, prompt, options);
      }
      throw error;
    }
  }

  async _executeRequest(modelName, prompt, options) {
    const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;
    
    const mimeType = options.response_mime_type || "text/plain";
    const useThinking = options.use_thinking || false;
    
    // ✅ FIX: Convert thinking budget to integer tokens
    const thinkingBudgetMap = {
      'low': 5000,
      'medium': 10000,
      'high': 20000
    };
    const thinkingBudget = typeof options.thinking_budget === 'number' 
      ? options.thinking_budget 
      : thinkingBudgetMap[options.thinking_budget] || 5000;

    const generationConfig = {
      temperature: options.temperature || 0.4,
      maxOutputTokens: options.max_tokens || 2048,
      responseMimeType: mimeType
    };

    // ✅ Add thinking config if requested
    if (useThinking) {
      generationConfig.thinkingConfig = {
        thinkingBudget: thinkingBudget
      };
    }

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    if (mimeType === "application/json") {
  try {
    // 1. Remove markdown code blocks
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 2. Find the first '{' and last '}' to handle conversational prefix/suffix
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // 3. Parse
    const parsed = JSON.parse(cleaned);
    
    // 4. ✅ CRITICAL: Validate required fields exist
    if (!parsed.suggestion_type || !parsed.message) {
      console.warn('⚠️ Incomplete AI response, retrying with more tokens...');
      // Retry with double tokens if response incomplete
      if (!options.retry_attempted) {
        return this._executeRequest(modelName, prompt, {
          ...options,
          max_tokens: (options.max_tokens || 2048) * 2,
          retry_attempted: true
        });
      }
    }
    
    return parsed;
  } catch (e) {
    console.error("Gemini JSON parse failed:", text);
    console.error("Parse error:", e);
    
    // ✅ Return a safe fallback instead of crashing
    return { 
      suggestion_type: "ERROR",
      message: "AI response was incomplete. Please try again.",
      error: "Failed to parse AI response", 
      raw: text.substring(0, 200) + "..."
    };
  }
}

    return text;
  }

  // =========================================================================
  // AI GUIDANCE FUNCTIONS - GEMINI 3 OPTIMIZED
  // =========================================================================

  /**
   * ✅ IMPROVED: Explain validation errors with beginner-friendly context
   */
  async explainError(circuitState, errorDetails) {
    const prompt = `You are a patient electronics mentor helping a beginner fix their ESP32 circuit.

**SITUATION:**
The student encountered an error while building their circuit.

**CIRCUIT CONTEXT:**
${JSON.stringify(circuitState, null, 2)}

**ERROR DETAILS:**
- Component: ${errorDetails.component_type}
- Pin Attempted: ${errorDetails.pin}
- Error Message: ${errorDetails.result?.error}
- System Suggestion: ${errorDetails.result?.suggestion}

**YOUR TASK:**
Help the student understand and fix this error using the Socratic method:

1. **Explain the "Why"** - What fundamental concept or hardware limitation caused this?
2. **Provide the "How"** - Give a clear, specific fix with exact pin numbers
3. **Teach the "Concept"** - Name the underlying electronics principle (for future learning)

**TONE GUIDELINES:**
- Be encouraging, not discouraging ("Great question!" not "This is wrong")
- Use simple analogies (compare GPIO pins to "doors" or "switches")
- Avoid jargon unless you immediately explain it
- Assume the student is smart but new to hardware

**OUTPUT JSON SCHEMA:**
{
  "title": "Short, friendly title (e.g., 'Oops! Wrong Pin Type')",
  "message": "2-3 sentence explanation using simple language and analogies",
  "fix": "Exact step-by-step fix (e.g., '1. Disconnect from GPIO 34. 2. Connect to GPIO 4 instead.')",
  "concept": "One-word or short concept name (e.g., 'Input vs Output', 'PWM Control', 'I2C Protocol')",
  "encouragement": "Short motivational phrase (e.g., 'You're getting the hang of this!')"
}

**EXAMPLE:**

Error: "GPIO 34 is INPUT ONLY"
Good response:
{
  "title": "Pin Direction Mismatch",
  "message": "Think of GPIO pins like doors in a building. GPIO 34 is an 'entrance only' door—signals can come IN, but nothing can go OUT. Your LED needs a pin that can push power OUT, like a two-way door.",
  "fix": "1. Remove the wire from GPIO 34. 2. Connect your LED to GPIO 4 instead. 3. GPIO 4 can handle output perfectly!",
  "concept": "Input vs Output Pins",
  "encouragement": "Nice catch! Understanding pin directions is a key ESP32 skill."
}

Now generate your response:`;

    return this.callGemini(prompt, { 
      temperature: 0.5, 
      response_mime_type: "application/json",
      use_thinking: true,
      thinking_budget: 5000,  // ✅ FIXED: Now using integer
      max_tokens: 2048
    });
  }

  /**
   * ✅ TEXT-ONLY MODE: Generates clear, step-by-step instructions for the user.
   */
  async suggestNextStep(circuitState) {
    const componentCount = circuitState.components?.length || 0;
    
    // Check for unwired components locally
    const unwiredComponents = circuitState.components?.filter(c => 
      (!c.connections || c.connections.length === 0) && c.type !== 'ESP32'
    ).map(c => c.label).join(', ');

    const prompt = `You are an IoT project mentor.

**CURRENT CIRCUIT:**
${JSON.stringify(circuitState, null, 2)}

**ANALYSIS HINTS:**
- Unwired Components: ${unwiredComponents ? unwiredComponents : "None"}

**YOUR TASK:**
Provide a clear, text-based guide on what the student should do next.
Do NOT generate code or machine actions. Just explain the steps like a teacher.

**SCENARIOS:**
1. **Unwired Components:** specific pin instructions (e.g., "Connect the DHT22 VCC to 3V3, GND to GND, and Data to GPIO 4").
2. **Missing Components:** Suggest adding a standard part (e.g., "Add an LED to GPIO 2 to visualize output").
3. **Ready to Code:** If wired, suggest a code logic idea.

**OUTPUT JSON SCHEMA:**
{
  "title": "Short Headline (e.g. 'Wire the DHT22')",
  "message": "Clear, step-by-step text instructions. Use bullet points or numbers if needed.",
  "reason": "Brief explanation of why this step is important",
  "concept": "The key concept (e.g. 'Pull-up Resistor', 'VCC/GND')"
}

Now analyze the circuit and guide the student:`;

    return this.callGemini(prompt, { 
      temperature: 0.5, 
      response_mime_type: "application/json",
      use_thinking: true,
      thinking_budget: 5000, 
      max_tokens: 2048
    });
  }

  /**
   * ✅ IMPROVED: Creative project ideas based on existing circuit
   */
  async getCreativeIdea(circuitState) {
    const components = circuitState.components?.map(c => c.type).join(', ') || 'ESP32';

    const prompt = `You are a creative IoT instructor inspiring students with fun project twists.

**STUDENT'S CURRENT CIRCUIT:**
Components: ${components}

**YOUR TASK:**
Propose ONE "level-up" idea that:
1. **Uses their existing hardware** (or adds just 1-2 cheap components)
2. **Makes it more interactive/fun** (games, automation, personalization)
3. **Is achievable** (not requiring advanced programming)

**CREATIVE ANGLES:**
- **Gamification:** Turn sensor data into a game/challenge
- **Automation:** Make it react to environment (auto-fan when hot, auto-light when dark)
- **Personalization:** Add customization (name display, color choice, sound effects)
- **Social:** Make it shareable (log data, web dashboard, notifications)

**OUTPUT JSON SCHEMA:**
{
  "title": "Catchy challenge name (e.g., 'Night Light Challenge')",
  "idea": "2-3 sentence description of the enhancement",
  "difficulty": "Easy" | "Medium" | "Advanced",
  "extra_components": ["LDR", "Buzzer"] or [],
  "fun_factor": "What makes this exciting"
}

**EXAMPLES:**

Circuit: ESP32 + DHT22 + LED
{
  "title": "Temperature Color Mood Light",
  "idea": "Make your LED change colors based on room temperature! Blue when cold (<20°C), green when comfortable, red when hot (>28°C). Bonus: Add a buzzer to beep when temperature hits extremes.",
  "difficulty": "Easy",
  "extra_components": ["RGB LED (optional)"],
  "fun_factor": "Visual feedback that matches your environment - it's like a mood ring for your room!"
}

Circuit: ESP32 + Button + OLED
{
  "title": "Reaction Time Game",
  "idea": "Display 'GET READY...' then after a random delay show 'NOW!'. Press the button as fast as you can. Display your reaction time in milliseconds. Can you beat 200ms?",
  "difficulty": "Medium",
  "extra_components": [],
  "fun_factor": "Compete with friends and track high scores!"
}

Now suggest a creative enhancement:`;

    return this.callGemini(prompt, { 
      temperature: 0.8, 
      response_mime_type: "application/json",
      use_thinking: true,
      thinking_budget: 10000,  // ✅ FIXED: Now using integer
      max_tokens: 1024
    });
  }

  /**
   * ✅ IMPROVED: Explain electronics concepts with analogies
   */
  async explainConcept(conceptName) {
    const prompt = `You are a skilled teacher explaining electronics to beginners.

**CONCEPT TO EXPLAIN:** "${conceptName}"

**YOUR TASK:**
Explain this concept using:
1. **Simple analogy** - Compare to everyday objects/situations
2. **Why it matters** - Practical importance for ESP32 projects
3. **Common mistake** - One typical beginner error related to this

Keep it 3-4 sentences total. Use friendly, conversational tone.

**EXAMPLES:**

Concept: "PWM"
"PWM (Pulse Width Modulation) is like flickering a light switch super fast. If you turn it on/off rapidly, your eye sees a dimmer light instead of full brightness. ESP32 uses this trick to control LED brightness and motor speed. Common mistake: Using PWM on a pin that doesn't support it (like GPIO 34)."

Concept: "I2C Protocol"
"I2C is like a bus route where multiple devices share the same two wires (SDA and SCL) to talk to the ESP32. Each device has a unique 'address', so the ESP32 knows who it's talking to. It's perfect for connecting screens, sensors, and more without using tons of pins. Common mistake: Forgetting pull-up resistors (though many modules include them)."

Now explain "${conceptName}":`;

    return this.callGemini(prompt, { 
      temperature: 0.5, 
      response_mime_type: "text/plain",
      max_tokens: 512
    });
  }

  /**
   * ✅ NEW: Verify suggestion safety using AI + deterministic check
   */
  async verifySuggestion(suggestion, circuitState, validationEngine) {
    const prompt = `You are a hardware safety validator for ESP32 circuits.

**PROPOSED SUGGESTION:**
${JSON.stringify(suggestion, null, 2)}

**CURRENT CIRCUIT:**
${JSON.stringify(circuitState, null, 2)}

**YOUR TASK:**
Verify if this suggestion is electrically safe and won't damage the ESP32.

**SAFETY CHECKS:**
1. No flash pins (GPIO 6-11)
2. No input-only pins for outputs
3. Proper voltage levels (3.3V logic, 5V tolerant pins)
4. No short circuits
5. Reasonable pin choices

**OUTPUT JSON:**
{
  "safe": true | false,
  "issues": ["Array of specific safety concerns, if any"],
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}`;

    const aiCheck = await this.callGemini(prompt, { 
      temperature: 0.1, 
      response_mime_type: "application/json",
      use_thinking: true,
      thinking_budget: 5000  // ✅ FIXED: Now using integer
    });
    
    let deterministicSafe = true;
    if (validationEngine && typeof validationEngine.validateSuggestion === 'function') {
        const check = validationEngine.validateSuggestion(suggestion);
        deterministicSafe = check.safe;
    }

    return { 
      safe: (aiCheck.safe !== false) && deterministicSafe,
      ai_issues: aiCheck.issues || [],
      confidence: aiCheck.confidence || 'MEDIUM'
    };
  }

  /**
   * ✅ NEW: Generate step-by-step wiring guide for a component
   */
  async generateWiringGuide(componentType, availablePins) {
    const prompt = `You are a hardware instructor creating a wiring guide.

**COMPONENT:** ${componentType}
**AVAILABLE ESP32 PINS:** ${availablePins.join(', ')}

**YOUR TASK:**
Create a clear, numbered step-by-step guide for wiring this component.

**OUTPUT JSON:**
{
  "component": "${componentType}",
  "steps": [
    {
      "step": 1,
      "instruction": "Connect component VCC to ESP32 3V3",
      "wire_color": "red",
      "why": "Powers the component"
    }
  ],
  "diagram_notes": "Additional visual hints",
  "testing_tip": "How to verify it's working"
}`;

    return this.callGemini(prompt, {
      temperature: 0.3,
      response_mime_type: "application/json",
      use_thinking: true,
      thinking_budget: 5000,  // ✅ FIXED: Now using integer
      max_tokens: 1536
    });
  }
}
