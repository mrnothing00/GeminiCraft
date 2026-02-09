import React from 'react';

// ==============================================================================
// PIN OFFSETS (SCALED UP)
// ==============================================================================
export const NTC_PIN_OFFSETS = {
  PIN1: { x: 30, y: 85 }, // Left Leg
  PIN2: { x: 60, y: 85 }  // Right Leg
};

/**
 * NTC Thermistor Component
 * UPGRADE: Bead changes color based on 'env.temperature'.
 */
const NTCSensor = ({ onPinClick, env }) => {
  // 1. Get Temperature (Default 25°C)
  const temp = env?.temperature ?? 25;

  // 2. Calculate Bead Color (Visual Feedback)
  let beadColor = "#2d3436"; // Default Dark Grey
  let labelColor = "#aaa";
  
  if (temp > 35) {
    beadColor = "#c0392b"; // Red (Hot)
    labelColor = "#ffcccc";
  } else if (temp < 10) {
    beadColor = "#2980b9"; // Blue (Cold)
    labelColor = "#cceeff";
  }

  return (
    // Increased container size from 60x60 to 90x90
    <div style={{ position: 'relative', width: 90, height: 90 }}>
      
      {/* Main SVG Body */}
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ overflow: 'visible' }}>
        
        {/* ─── LEGS (Pins) ──────────────────────────────────────────────── */}
        <line x1="30" y1="40" x2="30" y2="85" stroke="#ccc" strokeWidth="4" />
        <line x1="60" y1="40" x2="60" y2="85" stroke="#ccc" strokeWidth="4" />

        {/* ─── BODY (The Bead) ──────────────────────────────────────────── */}
        {/* Shadow/Outline */}
        <ellipse cx="45" cy="35" rx="22" ry="20" fill="#111" stroke="#000" strokeWidth="2" />
        
        {/* [SIMULATION VISUAL] Main Bead Color */}
        <ellipse 
          cx="45" cy="35" rx="20" ry="18" 
          fill={beadColor} 
          style={{ transition: 'fill 0.3s ease' }} 
        />
        
        {/* Shine/Reflection */}
        <ellipse cx="38" cy="28" rx="6" ry="5" fill="#fff" opacity="0.2" />

        {/* Label */}
        <text 
          x="45" y="38" 
          fill={labelColor} 
          fontSize="10" 
          fontWeight="bold" 
          textAnchor="middle" 
          fontFamily="monospace" 
          style={{ pointerEvents: 'none', transition: 'fill 0.3s' }}
        >
          NTC
        </text>
        <text x="45" y="50" fill={labelColor} opacity="0.7" fontSize="8" textAnchor="middle" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
          10K
        </text>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* PIN 1 */}
        <circle 
          cx="30" cy="85" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'PIN1'); }}
        />

        {/* PIN 2 */}
        <circle 
          cx="60" cy="85" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'PIN2'); }}
        />
      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 90, left: 22, fontSize: 10, color: '#aaa', fontWeight: 'bold' }}>1</div>
      <div style={{ position: 'absolute', top: 90, left: 56, fontSize: 10, color: '#aaa', fontWeight: 'bold' }}>2</div>
    </div>
  );
};

export default NTCSensor;