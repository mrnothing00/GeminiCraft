import React, { useState, useEffect } from 'react';

// --- THEME CONFIGURATION ---
const THEMES = {
  VALIDATION_ERROR: { color: '#ff5252', icon: '🚨', label: 'Circuit Error' },
  SUGGESTION:       { color: '#00e676', icon: '💡', label: 'Suggestion' },
  CREATIVE_OPPORTUNITY: { color: '#e056fd', icon: '✨', label: 'Fun Twist' },
  TIP:              { color: '#3a86ff', icon: 'ℹ️', label: 'Pro Tip' },
  MANUAL_ASK:       { color: '#ff9f43', icon: '🤖', label: 'AI Guide' }, // Renamed for clarity
  DEFAULT:          { color: '#3a86ff', icon: '🤖', label: 'Guidance' }
};

/**
 * GuidanceRenderer
 * Displays AI advice as a clear, text-based guide.
 * ✅ UPDATED: Removed action buttons to focus on pure text instructions.
 */
export default function GuidanceRenderer() {
  const [guidance, setGuidance] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // --- EVENT LISTENERS ---
  useEffect(() => {
    // 1. Listen for new guidance
    const handleGuidance = (e) => {
      console.log("🔔 UI received guidance:", e.detail);
      setGuidance(e.detail);
      setIsVisible(true);
      setIsThinking(false);

      // Auto-dismiss low priority tips after 5 seconds
      if (e.detail.priority === 'low') {
        setTimeout(() => setIsVisible(false), 5000);
      }
    };

    // 2. Listen for thinking status
    const handleStatus = (e) => {
      if (e.detail.status === 'thinking') {
        setIsThinking(true);
        setIsVisible(true);
      } else {
        setIsThinking(false);
      }
    };

    document.addEventListener('ai:guidance', handleGuidance);
    document.addEventListener('ai:status', handleStatus);
    
    return () => {
      document.removeEventListener('ai:guidance', handleGuidance);
      document.removeEventListener('ai:status', handleStatus);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setGuidance(null), 300); // Clear data after animation
  };

  // --- RENDER: THINKING STATE ---
  if (isThinking) {
    return (
      <div style={{ ...panelStyle, ...loadingStyle, opacity: 1, transform: 'translateY(0)' }}>
        <div className="pulse-ring"></div>
        <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="spin">⚙️</span> AI is analyzing...
        </span>
        <style>{`
          @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 0; } }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .pulse-ring { position: absolute; inset: 0; border-radius: 12px; border: 2px solid #3a86ff; animation: pulse 1.5s infinite; }
          .spin { display: inline-block; animation: spin 2s linear infinite; }
        `}</style>
      </div>
    );
  }

  // --- RENDER: EMPTY STATE ---
  if (!isVisible || !guidance || !guidance.guidance) return null;

  // Extract Data
  const { trigger } = guidance;
  const content = guidance.guidance;
  const theme = THEMES[trigger] || THEMES.DEFAULT;
  
  // Normalize data fields
  const title = content.title || "AI Guide";
  const message = content.message;
  // We prioritize 'concept' or 'learningGoal' for the educational tag
  const concept = content.concept || content.learningGoal;

  return (
    <div style={{ 
      ...panelStyle, 
      opacity: isVisible ? 1 : 0, 
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)', 
      borderColor: theme.color 
    }}>
      
      {/* HEADER */}
      <div style={{ ...headerStyle, borderBottom: `1px solid ${theme.color}44` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{theme.icon}</span>
          <span style={{ fontWeight: 'bold', color: theme.color, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            {theme.label}
          </span>
        </div>
        <button onClick={handleClose} style={closeBtnStyle}>✕</button>
      </div>

      {/* BODY */}
      <div style={bodyStyle}>
        <h3 style={titleStyle}>{title}</h3>
        
        {/* Message with line break support */}
        <div style={messageStyle}>
          {message.split('\n').map((line, i) => (
            <p key={i} style={{ margin: '0 0 6px 0' }}>{line}</p>
          ))}
        </div>

        {/* CONCEPT TAG (Educational) */}
        {concept && (
          <div 
            style={{...conceptTagStyle, borderColor: theme.color + '44', color: theme.color}} 
            title="Educational Concept"
          >
            📚 Learn: {concept}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

const panelStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: 320,
  backgroundColor: 'rgba(22, 22, 37, 0.95)',
  backdropFilter: 'blur(10px)',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: 12,
  boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
  color: '#eee',
  overflow: 'hidden',
  zIndex: 9999,
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

const loadingStyle = {
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  fontSize: 14,
  fontWeight: 'bold',
  color: '#3a86ff',
  borderColor: '#3a86ff',
  minHeight: 80
};

const headerStyle = {
  padding: '12px 16px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const bodyStyle = {
  padding: '16px'
};

const titleStyle = {
  margin: '0 0 8px 0',
  fontSize: 16,
  color: '#fff',
  fontWeight: '700',
  letterSpacing: '0.5px'
};

const messageStyle = {
  margin: 0,
  fontSize: 14,
  color: '#b0b0c0',
  lineHeight: 1.5
};

const conceptTagStyle = {
  display: 'inline-block',
  marginTop: 12,
  padding: '4px 8px',
  fontSize: 11,
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 4,
  border: '1px solid',
  fontWeight: '500'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#666',
  fontSize: 18,
  cursor: 'pointer',
  padding: '0 4px',
  lineHeight: 1
};