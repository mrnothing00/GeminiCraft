import React, { useState } from 'react';

// ==============================================================================
// PIN OFFSETS
// Standard LED: Cathode (Short/-) Left, Anode (Long/+) Right
// ==============================================================================
export const LED_PIN_OFFSETS = {
  CATHODE: { x: 25, y: 70 }, // Left Pin (-)
  ANODE:   { x: 45, y: 70 }  // Right Pin (+)
};

// SIMULATION COLORS: 'on' is bright, 'off' is dark/dim
const COLORS = {
  RED:    { on: '#ff3333', off: '#440000', glow: '0 0 15px rgba(255, 0, 0, 0.9)' },
  BLUE:   { on: '#00ccff', off: '#001133', glow: '0 0 15px rgba(0, 180, 255, 0.9)' },
  GREEN:  { on: '#00ff00', off: '#003300', glow: '0 0 15px rgba(0, 255, 0, 0.9)' },
  YELLOW: { on: '#ffff00', off: '#444400', glow: '0 0 15px rgba(255, 255, 0, 0.9)' }
};

const LEDSensor = ({ onPinClick, isOn = false }) => {
  const [colorKey, setColorKey] = useState('GREEN'); // Default Color
  const [showPicker, setShowPicker] = useState(false);

  const c = COLORS[colorKey];

  const handleColorSelect = (key, e) => {
    e.stopPropagation();
    setColorKey(key);
    setShowPicker(false);
  };

  return (
    <div style={{ position: 'relative', width: 70, height: 70 }}>
      
      {/* ─── COLOR PICKER MENU ────────────────────────────────────────── */}
      {/* Hidden when running, visible on click */}
      {showPicker && (
        <div style={{
          position: 'absolute', top: -35, left: -15, width: 100,
          background: '#222', border: '1px solid #444', borderRadius: 4, padding: 4,
          display: 'flex', justifyContent: 'space-between', zIndex: 100,
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}>
          {Object.keys(COLORS).map((key) => (
            <div 
              key={key}
              onClick={(e) => handleColorSelect(key, e)}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: COLORS[key].on,
                cursor: 'pointer',
                border: key === colorKey ? '2px solid #fff' : '1px solid #000'
              }}
              title={key}
            />
          ))}
        </div>
      )}

      {/* Main SVG Body */}
      <svg width="70" height="70" viewBox="0 0 70 70" style={{ overflow: 'visible' }}>
        
        {/* ─── LEGS ─────────────────────────────────────────────────────── */}
        <line x1="25" y1="45" x2="25" y2="70" stroke="#ccc" strokeWidth="3" />
        <line x1="45" y1="45" x2="45" y2="70" stroke="#ccc" strokeWidth="3" />

        {/* ─── BULB BODY ────────────────────────────────────────────────── */}
        <g 
          onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }} 
          style={{ 
            cursor: 'pointer', 
            transition: 'all 0.1s ease-in-out',
            // [SIMULATION VISUAL] CSS Drop-Shadow Glow
            filter: isOn ? `drop-shadow(${c.glow})` : 'none'
          }}
        >
          
          {/* Internal Glow Circle (simulates the filament light) */}
          <circle 
            cx="35" cy="30" r="12" 
            fill="#fff" 
            opacity={isOn ? 0.6 : 0} 
            style={{ transition: 'opacity 0.1s' }}
          />
          
          {/* Main Dome (Changes color On vs Off) */}
          <path 
            d="M 15 35 L 15 25 A 20 20 0 0 1 55 25 L 55 35 Z" 
            fill={isOn ? c.on : c.off} 
            stroke="#111" 
            strokeWidth="1" 
            style={{ transition: 'fill 0.1s' }}
          />
          
          {/* Base Rim */}
          <rect 
            x="13" y="35" width="44" height="10" rx="2" 
            fill={isOn ? c.on : c.off} 
            stroke="#111" strokeWidth="1"
            style={{ transition: 'fill 0.1s' }} 
          />
          
          {/* Reflection Highlight (Glass effect) */}
          
          <ellipse cx="25" cy="20" rx="5" ry="8" fill="white" opacity="0.4" transform="rotate(-20 25 20)" />
        </g>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* Cathode (-) */}
<circle
  cx="25"
  cy="70"
  r="10"
  fill="rgba(255,255,255,0.01)"
  stroke="rgba(0,0,0,0)"
  style={{ cursor: 'crosshair', pointerEvents: 'auto' }}
  onMouseDown={(e) => {
    e.stopPropagation();
     console.log('[LED] CATHODE pin clicked');
    onPinClick?.(e, 'CATHODE');
  }}
/>

{/* Anode (+) */}
<circle
  cx="45"
  cy="70"
  r="10"
  fill="rgba(255,255,255,0.01)"
  stroke="rgba(0,0,0,0)"
  style={{ cursor: 'crosshair', pointerEvents: 'auto' }}
  onMouseDown={(e) => {
    e.stopPropagation();
    onPinClick?.(e, 'ANODE');
  }}
/>


      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 72, left: 18, fontSize: 10, color: '#aaa', fontWeight: 'bold' }}>-</div>
      <div style={{ position: 'absolute', top: 72, left: 42, fontSize: 10, color: '#aaa', fontWeight: 'bold' }}>+</div>
    </div>
  );
};

export default LEDSensor;