import React from 'react';

// ==============================================================================
// PIN OFFSETS
// These X/Y values must match the invisible circles at the bottom of the SVG.
// ==============================================================================
export const POTENTIOMETER_PIN_OFFSETS = {
  GND:    { x: 13, y: 55 }, // Left Pin
  OUTPUT: { x: 30, y: 55 }, // Middle Pin (Wiper)
  VCC:    { x: 47, y: 55 }  // Right Pin
};

/**
 * Potentiometer Component (Rotary Knob)
 * Visuals: Metal shaft style with a clear indicator line.
 * Note: Rotation logic is handled by the parent DrawingCanvas wrapper.
 */
const PotentiometerSensor = ({ onPinClick }) => {
  return (
    <div style={{ position: 'relative', width: 60, height: 60 }}>
      
      {/* Main SVG Body */}
      <svg width="60" height="60" viewBox="0 0 60 60" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#999" />
            <stop offset="50%" stopColor="#eee" />
            <stop offset="100%" stopColor="#999" />
          </linearGradient>
        </defs>

        {/* ─── LEGS (Pins) ──────────────────────────────────────────────── */}
        <line x1="13" y1="40" x2="13" y2="55" stroke="#ccc" strokeWidth="3" />
        <line x1="30" y1="40" x2="30" y2="55" stroke="#ccc" strokeWidth="3" />
        <line x1="47" y1="40" x2="47" y2="55" stroke="#ccc" strokeWidth="3" />

        {/* ─── BODY (Front View) ────────────────────────────────────────── */}
        {/* The dark base */}
        <rect x="5" y="25" width="50" height="20" rx="3" fill="#333" stroke="#111" strokeWidth="1" />
        
        {/* The silver metal top plate */}
        <path d="M 5 25 L 55 25 L 50 15 L 10 15 Z" fill="#7f8c8d" stroke="#555" strokeWidth="1" />

        {/* The Shaft (Knob) */}
        <rect x="22" y="0" width="16" height="20" fill="url(#metalGrad)" stroke="#888" strokeWidth="1" />
        
        {/* [SIMULATION VISUAL] Indicator Line */}
        {/* A red line on the knob so you can see the rotation angle clearly */}
        <rect x="29" y="2" width="2" height="10" fill="#e74c3c" />

        {/* Shaft details (grooves for texture) */}
        <line x1="24" y1="2" x2="24" y2="18" stroke="#aaa" strokeWidth="0.5" />
        <line x1="36" y1="2" x2="36" y2="18" stroke="#aaa" strokeWidth="0.5" />

        {/* Label */}
        <text x="30" y="40" fill="#aaa" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
          POT 10K
        </text>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* GND */}
        <circle 
          cx="13" cy="55" r="4" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }}
        />

        {/* OUTPUT */}
        <circle 
          cx="30" cy="55" r="4" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'OUTPUT'); }}
        />

        {/* VCC */}
        <circle 
          cx="47" cy="55" r="4" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }}
        />
      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 58, left: 5,  fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>GND</div>
      <div style={{ position: 'absolute', top: 58, left: 20, fontSize: 8, color: '#ffd700', fontWeight: 'bold' }}>OUT</div>
      <div style={{ position: 'absolute', top: 58, left: 42, fontSize: 8, color: '#ff4d4d', fontWeight: 'bold' }}>VCC</div>
    </div>
  );
};

export default PotentiometerSensor;