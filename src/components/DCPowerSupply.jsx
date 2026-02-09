import React, { useState } from 'react';

// ==============================================================================
// PIN OFFSETS
// Two terminals on top. VCC (Left/Red wire location), GND (Right/Black wire location)
// ==============================================================================
export const DC_SUPPLY_PIN_OFFSETS = {
  VCC: { x: 70, y: 10 }, // Positive Terminal
  GND: { x: 70, y: 30 }  // Negative Terminal
};

/**
 * DC Power Supply / 9V Battery Component
 * UPGRADE: Added a "Power LED" visual to indicate the component is active.
 */
const DCPowerSupply = ({ onPinClick }) => {
  const [voltage, setVoltage] = useState('12V'); // Default 12V

  const handleVoltageChange = (e) => {
    e.stopPropagation();
    const newVolts = prompt("Enter Voltage (e.g., 5V, 9V, 12V):", voltage);
    if (newVolts) {
      setVoltage(newVolts);
    }
  };

  return (
    <div style={{ position: 'relative', width: 70, height: 90 }}>
      
      {/* Main SVG Body */}
      <svg width="70" height="90" viewBox="0 0 70 90" style={{ overflow: 'visible' }}>
        
        {/* ─── WIRES (Extending Right) ──────────────────────────────────── */}
        {/* Red Wire (VCC) */}
        <path d="M 30 10 L 30 5 L 70 10" stroke="#e74c3c" strokeWidth="3" fill="none" />
        {/* Black Wire (GND) */}
        <path d="M 45 10 L 45 5 L 70 30" stroke="#2d3436" strokeWidth="3" fill="none" />

        {/* ─── BATTERY BODY ─────────────────────────────────────────────── */}
        {/* Top Cap (Connector Board)  */}
        <rect x="15" y="10" width="45" height="5" fill="#333" />
        
        {/* Terminals (Snap Connectors) */}
        {/* Smaller Circle (Male) */}
        <circle cx="25" cy="8" r="4" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="1" />
        {/* Larger Hexagon/Circle (Female) */}
        <path d="M 45 4 L 49 6 L 49 10 L 45 12 L 41 10 L 41 6 Z" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="1" />

        {/* Top Half (Orange/Brown Brand Color) */}
        <rect x="10" y="15" width="55" height="30" fill="#d35400" stroke="#a04000" strokeWidth="1" />
        
        {/* Bottom Half (Black) */}
        <rect x="10" y="45" width="55" height="45" fill="#2d3436" stroke="#000" strokeWidth="1" rx="2" />

        {/* [SIMULATION VISUAL] Status LED */}
        {/* Adds a glowing green dot to show the battery is "Live" */}
        <circle cx="20" cy="80" r="2.5" fill="#2ecc71" />
        <circle cx="20" cy="80" r="5" fill="#2ecc71" opacity="0.3" />

        {/* ─── LABELS ───────────────────────────────────────────────────── */}
        <text 
          x="37.5" y="65" 
          fill="#fff" 
          fontSize="14" 
          fontWeight="bold" 
          fontFamily="sans-serif" 
          textAnchor="middle" 
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          onClick={handleVoltageChange}
        >
          {voltage}
        </text>
        <text x="37.5" y="80" fill="#aaa" fontSize="7" fontFamily="monospace" textAnchor="middle" style={{ pointerEvents: 'none' }}>
          POWER SUPPLY
        </text>
        {/* Edit Hint */}
        <text x="58" y="60" fontSize="8" style={{ pointerEvents: 'none' }}>✏️</text>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* VCC (+ Red Wire Tip) */}
        <circle 
          cx="70" cy="10" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }}
        />

        {/* GND (- Black Wire Tip) */}
        <circle 
          cx="70" cy="30" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }}
        />

      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 5, left: 75, fontSize: 9, color: '#e74c3c', fontWeight: 'bold' }}>+</div>
      <div style={{ position: 'absolute', top: 25, left: 75, fontSize: 9, color: '#aaa', fontWeight: 'bold' }}>-</div>
    </div>
  );
};

export default DCPowerSupply;