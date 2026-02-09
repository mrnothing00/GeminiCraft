import React from 'react';

// ==============================================================================
// 1. PIN OFFSETS (Crucial for Wiring)
// These X/Y values MUST match the "cx" and "cy" of the circles in the SVG below.
// ==============================================================================
export const DS18B20_PIN_OFFSETS = {
  GND:  { x: 13, y: 55 }, // Left Pin
  DATA: { x: 30, y: 55 }, // Middle Pin
  VCC:  { x: 47, y: 55 }  // Right Pin
};

/**
 * DS18B20 Temperature Sensor (TO-92 Package)
 * UPGRADE: Body tints Red/Blue based on 'env.temperature'.
 */
const DS18B20Sensor = ({ onPinClick, env }) => {
  // 1. Get Temperature (Default 25°C)
  const temp = env?.temperature ?? 25;

  // 2. Calculate Thermal Color
  let bodyColor = "#333"; // Default Black
  let backColor = "#222"; // Default Darker Black

  if (temp > 35) {
    bodyColor = "#5c2b2b"; // Reddish Black (Hot)
    backColor = "#4a1f1f";
  } else if (temp < 10) {
    bodyColor = "#1f3a4a"; // Bluish Black (Cold)
    backColor = "#152a36";
  }

  return (
    <div style={{ position: 'relative', width: 60, height: 60 }}>
      
      {/* Main SVG Body */}
      <svg width="60" height="60" viewBox="0 0 60 60" style={{ overflow: 'visible' }}>
        
        {/* ─── LEGS (Pins) ──────────────────────────────────────────────── */}
        {/* Pin 1: GND (Left) */}
        <line x1="13" y1="38" x2="13" y2="55" stroke="#ccc" strokeWidth="3" />
        {/* Pin 2: DATA (Middle) */}
        <line x1="30" y1="38" x2="30" y2="55" stroke="#ccc" strokeWidth="3" />
        {/* Pin 3: VCC (Right) */}
        <line x1="47" y1="38" x2="47" y2="55" stroke="#ccc" strokeWidth="3" />

        {/* ─── BODY (TO-92 Package) ─────────────────────────────────────── */}
        {/* Back Curve (The round part of the sensor) */}
        <path 
          d="M 10 15 Q 30 -5 50 15" 
          fill={backColor} 
          stroke="#111" 
          strokeWidth="1"
          style={{ transition: 'fill 0.5s ease' }}
        />
        {/* Front Flat Face */}
        <rect 
          x="10" y="15" width="40" height="25" 
          fill={bodyColor} 
          stroke="#111" strokeWidth="1" 
          style={{ transition: 'fill 0.5s ease' }}
        />
        
        {/* Text Label */}
        <text x="30" y="32" fill="#fff" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace" style={{ pointerEvents: 'none', opacity: 0.8 }}>
          DS18B20
        </text>

        {/* ─── CLICKABLE HOTSPOTS (The "Integration" Part) ──────────────── */}
        
        {/* GND Hotspot */}
        <circle 
          cx="13" cy="55" r="4" 
          fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick('GND'); }}
        />

        {/* DATA Hotspot */}
        <circle 
          cx="30" cy="55" r="4" 
          fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick('DATA'); }}
        />

        {/* VCC Hotspot */}
        <circle 
          cx="47" cy="55" r="4" 
          fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick('VCC'); }}
        />
      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 58, left: 5,  fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>GND</div>
      <div style={{ position: 'absolute', top: 58, left: 24, fontSize: 8, color: '#4da6ff', fontWeight: 'bold' }}>DQ</div>
      <div style={{ position: 'absolute', top: 58, left: 42, fontSize: 8, color: '#ff4d4d', fontWeight: 'bold' }}>VCC</div>
    </div>
  );
};

export default DS18B20Sensor;