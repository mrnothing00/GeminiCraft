import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getOrchestrator }          from './ai/GeminiOrchestrator.js';
import { CodeGenerator }            from './codegen/CodeGenerator.js';
import { VirtualSimulator }         from './simulation/VirtualSimulator.js';
import { WebSerialBridge, stubCompile, BRIDGE_STATE } from './hardware/WebSerialBridge.js';
import DrawingCanvas                from './canvas/DrawingCanvas.jsx';
import { GuideOrchestrator }        from './guide/GuideOrchestrator.js';
// ✅ FIX 1: Import default export (removed curly braces)
import GuidanceRenderer             from './guide/GuidanceRenderer.jsx';
import { PinDoctor }                from './validation/PinDoctor.js';

// ---------------------------------------------------------------------------
// 1. BOOTSTRAP AI (Singleton Pattern)
// ---------------------------------------------------------------------------
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let orchestrator = null;

if (API_KEY) {
  try {
    orchestrator = getOrchestrator(API_KEY);
  } catch (e) {
    console.error("Gemini Init Failed:", e);
  }
} else {
  console.warn("⚠️ No API Key found. AI features will be disabled.");
  orchestrator = { isMock: true, generateContent: async () => ({ text: "// No API Key - Using Mock Generator" }) };
}

export default function App() {
  // ─── State ───────────────────────────────────────────────────────────────
  const [circuitState, setCircuitState] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeIssues, setCodeIssues]       = useState([]);
  const [codeVerified, setCodeVerified]   = useState(false);
  
  // NEW: Store User Intent (e.g. "Fire Alarm System")
  const [userIntent, setUserIntent] = useState(""); 

  const [status, setStatus] = useState('idle'); 
  // 'idle' | 'generating' | 'simulating' | 'flashing'
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  const [flashStatus, setFlashStatus]     = useState(BRIDGE_STATE.DISCONNECTED);
  const [flashProgress, setFlashProgress] = useState(0);
  const [flashError, setFlashError]       = useState(null);

  // ⭐ Guide State
  const [guidanceActive, setGuidanceActive] = useState(null);
  const [guideEnabled, setGuideEnabled] = useState(true);
  const [guidanceHistory, setGuidanceHistory] = useState([]);
  
  // ─── Refs ────────────────────────────────────────────────────────────────
  const codeGenRef   = useRef(new CodeGenerator(orchestrator)); 
  const simRef = useRef(null);
  if (!simRef.current) {
    simRef.current = new VirtualSimulator();
  }
  const bridgeRef    = useRef(new WebSerialBridge());
  const guideRef     = useRef(null);
  const pinDoctorRef = useRef(null);

  // ─── Effects ─────────────────────────────────────────────────────────────

  // 1) Hardware Bridge Listeners
  useEffect(() => {
    bridgeRef.current.onStatusChange((s) => {
      setFlashStatus(s.state);
      setFlashProgress(s.progress);
      setFlashError(s.error);
    });
  }, []);

  // 2) Simulator → Canvas Loop
  useEffect(() => {
    const handleStateChange = (simState) => {
      // Optional: Log simulation state for debug
      // console.log("🎮 Simulator state:", simState);
      if (window.__setSimState) {
        window.__setSimState(simState);
      }
    };

    simRef.current.onStateChange(handleStateChange);
  }, []);

  // 3) Bind CodeGenerator to orchestrator once
  useEffect(() => {
    codeGenRef.current = new CodeGenerator(orchestrator);
  }, []);

  // 4) Initialize Guide when circuit exists
  useEffect(() => {
    if (!API_KEY || !circuitState) return;

    if (!pinDoctorRef.current) {
      pinDoctorRef.current = new PinDoctor(orchestrator);
    }

    const guide = new GuideOrchestrator(circuitState, pinDoctorRef.current, API_KEY);
    guideRef.current = guide;

    const onSuggestion = (suggestion) => {
      const newGuidance = {
        id: `suggestion-${Date.now()}`,
        trigger: 'manual_ask',
        priority: 'medium',
        guidance: suggestion,
        timestamp: Date.now(),
      };
      setGuidanceActive(newGuidance);
      setGuidanceHistory((prev) => [newGuidance, ...prev]);
    };

    const handleGlobalGuidance = (e) => {
      const { guidance, trigger, priority } = e.detail || {};
      const newTip = {
        id: `tip_${Date.now()}`,
        guidance,
        trigger,
        priority,
        timestamp: Date.now(),
      };
      setGuidanceActive(newTip);
      setGuidanceHistory((prev) => [newTip, ...prev]);
    };

    guide.on('suggestion:ready', onSuggestion);
    document.addEventListener('ai:guidance', handleGlobalGuidance);

    return () => {
      document.removeEventListener('ai:guidance', handleGlobalGuidance);
      guide.off?.('suggestion:ready', onSuggestion);
      if (guideRef.current === guide) guideRef.current = null;
    };
  }, [circuitState]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleCircuitChange = useCallback((state) => {
    setCircuitState(state);
    
    if (guideRef.current) {
      guideRef.current.notifyCircuitEvent('circuit:updated', state);
    }

    // Stop simulation if user changes circuit while running
    if (statusRef.current === 'simulating') {
        simRef.current.stop();
        setStatus('idle');
    }
  }, []); 

  // Generate Code Button
  const handleGenerate = async () => {
    if (!circuitState || circuitState.components.length < 1) {
      alert("Please build a circuit first!");
      return;
    }

    setStatus('generating');
    setCodeIssues([]);
    setGeneratedCode('// 🧠 Analyzing circuit connections...\n// 🤖 Asking Gemini to write firmware...\n// Please wait...');

    try {
      // ✅ UPDATED: Pass userIntent to the generator
      const code = await codeGenRef.current.generate(circuitState, userIntent);
      setGeneratedCode(code);
      setCodeVerified(true);
    } catch (err) {
      console.error(err);
      setCodeIssues([`Generation error: ${err.message}`]);
      setGeneratedCode('// Error generating code. Check console.');
    } finally {
      setStatus('idle');
    }
  };

  // Run/Stop Simulation Button
  const handleSimulate = () => {
    if (!generatedCode || !circuitState) return;

    if (status === 'simulating') {
      // STOP Logic
      simRef.current.stop();
      setStatus('idle');
    } else {
      // START Logic
      try {
        simRef.current.load(generatedCode, { components: circuitState.components });
        simRef.current.start();
        setStatus('simulating');
      } catch (err) {
          alert("Simulation Error: " + err.message);
          setStatus('idle');
      }
    }
  };

  const [simulationPaused, setSimulationPaused] = useState(false);

const handlePauseSimulation = () => {
  if (status === 'simulating') {
    setSimulationPaused(!simulationPaused);
    // Don't stop simulator, just pause updates
  }
};

  const handleFlash = async () => {
    if (!generatedCode) return;
    setStatus('flashing');
    setFlashError(null);
    try {
      if (flashStatus === BRIDGE_STATE.DISCONNECTED || flashStatus === BRIDGE_STATE.CONNECT_ERROR) {
        await bridgeRef.current.connect();
      }
      const binary = await stubCompile(generatedCode);
      await bridgeRef.current.flash(binary);
    } catch (err) {
      setFlashError(err.message);
      alert("Flash Failed: " + err.message);
    } finally {
      setStatus('idle');
    }
  };

  const handleReset = () => {
    if (confirm("Reset everything? This will clear your sketch.")) {
        window.location.reload();
    }
  };

  const handleAskGuide = async () => {
    if (!guideEnabled) return;
    if (guideRef.current) await guideRef.current.suggestNextStep();
  };

  const handleExplainConcept = async (concept) => {
    alert(`AI Concept: ${concept}`); 
  };

  // ─── UI Helpers ──────────────────────────────────────────────────────────
  const isSimulating = status === 'simulating';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f1a', color: '#eee', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden' }}>

      {/* 1. MAIN CANVAS AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <div style={{ height: 50, background: '#12121f', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontWeight: 'bold', color: '#3a86ff' }}>GEMINICRAFT</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
             <button onClick={() => setGuideEnabled(!guideEnabled)} style={{ background: guideEnabled ? '#3a86ff22' : '#2a2a3a', color: guideEnabled ? '#3a86ff' : '#666', border: '1px solid #333', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
                {guideEnabled ? '🤖 Guide ON' : '🔇 Guide OFF'}
             </button>
             <button onClick={handleAskGuide} style={{ background: '#00e67622', color: '#00e676', border: '1px solid #00e67644', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 'bold' }}>
                💡 Help Me
             </button>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
            <DrawingCanvas 
                orchestrator={orchestrator} 
                onCircuitChange={handleCircuitChange}
                isSimulating={isSimulating} 
            />
            
            {guidanceActive && guideEnabled && (
                <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
                    {/* ✅ FIX 2: Updated component name to match default import */}
                    <GuidanceRenderer 
                        guidance={guidanceActive} 
                        onDismiss={() => setGuidanceActive(null)}
                        onExplainConcept={handleExplainConcept}
                    />
                </div>
            )}
        </div>
      </div>

      {/* 2. RIGHT SIDEBAR (Your Exact Design) */}
      <div style={{ width: 380, background: '#12121f', borderLeft: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 15, borderBottom: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', color: '#666', letterSpacing: 1 }}>ACTIONS</div>
            
            {/* ✅ NEW: AI Intent Input */}
            <input 
              type="text" 
              placeholder="Ex: Turn on fan if Temp > 30°C..."
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              disabled={status === 'generating'}
              style={{
                width: '100%',
                padding: '10px',
                background: '#0d0d1a',
                border: '1px solid #3a86ff44',
                color: '#fff',
                borderRadius: 6,
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <button onClick={handleGenerate} disabled={status === 'generating'} style={btnStyle('#3a86ff', status === 'generating')}>
                {status === 'generating' ? '⏳ Generating...' : '⚡ Generate Code'}
            </button>

            {/* TOGGLE BUTTON */}
            <button onClick={handleSimulate} disabled={!generatedCode} style={btnStyle(isSimulating ? '#ff5252' : '#00e676', !generatedCode)}>
                {isSimulating ? '⏹ Stop Simulation' : '▶ Run Simulation'}
            </button>

            <button onClick={handleFlash} disabled={!generatedCode || status === 'flashing'} style={btnStyle('#e056fd', !generatedCode || status === 'flashing')}>
                {status === 'flashing' ? `📡 Flashing... ${flashProgress}%` : '📡 Flash Hardware'}
            </button>

            <button onClick={handleReset} style={btnStyle('#666', false)}>
                🔄 Reset All
            </button>

            {flashStatus !== BRIDGE_STATE.DISCONNECTED && (
                <div style={{ fontSize: 10, color: '#888', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: flashStatus === BRIDGE_STATE.CONNECTED ? '#00e676' : '#ffab40' }}></div>
                    Status: {flashStatus} {flashError ? `(${flashError})` : ''}
                </div>
            )}
        </div>

        {/* CODE OUTPUT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '8px 15px', fontSize: 10, fontWeight: 'bold', color: '#666', letterSpacing: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span>GENERATED C++</span>
                {generatedCode && <span style={{color:'#3a86ff'}}>{generatedCode.split('\n').length} lines</span>}
            </div>
            <div style={{ flex: 1, overflow: 'auto', background: '#0d0d1a', margin: '0 10px 10px', borderRadius: 6, border: '1px solid #2a2a3a', padding: 10 }}>
                {generatedCode ? (
                    <pre style={{ fontSize: 11, lineHeight: 1.5, color: '#a6accd', whiteSpace: 'pre-wrap' }}>
                        {generatedCode}
                    </pre>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 12, textAlign: 'center', padding: 20 }}>
                        Build your circuit,<br/>describe logic,<br/>then click "Generate Code"
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

function btnStyle(color, disabled) {
  return {
    background: disabled ? '#1f1f2e' : `${color}22`,
    color: disabled ? '#444' : color,
    border: `1px solid ${disabled ? '#2a2a3a' : color}`,
    borderRadius: 6,
    padding: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 12,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s',
  };
}