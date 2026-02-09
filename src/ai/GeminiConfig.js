/**
 * src/ai/GeminiConfig.js
 * Central configuration for Gemini models and budgets
 */

export const GEMINI_MODELS = {
  VISION: 'gemini-3-flash-preview',      // ✅ Correct
  CODE: 'gemini-3-flash-preview',        // ✅ Correct
  REASONING: 'gemini-3-flash-preview'    // ✅ Correct
};

export const GEMINI_FEATURES = {
  // Gemini 3 specific features
  thinking: true,          // Enable chain-of-thought
  multimodal: true,        // Vision + Text
  toolUse: true,           // Function calling
  longContext: true        // 1M+ token context
};

// ✅ DEFINITION: Thinking Budgets
export const THINKING_BUDGETS = {
  low: 5000,
  medium: 10000,
  high: 20000
};

// ✅ ADDED: This helper function was missing and caused the crash!
export const validateThinkingBudget = (budget) => {
  // If it's already a number, return it (clamped to max 64k if needed)
  if (typeof budget === 'number') {
    return budget;
  }
  
  // If it's a string key (low/medium/high), map it
  if (typeof budget === 'string' && THINKING_BUDGETS[budget]) {
    return THINKING_BUDGETS[budget];
  }

  // Default fallback
  return THINKING_BUDGETS.medium;
};

// Optional: Useful default config for other AI services
export const GENERATION_CONFIG = {
  temperature: 0.4,
  maxOutputTokens: 8192,
  topP: 0.95,
  topK: 40
};