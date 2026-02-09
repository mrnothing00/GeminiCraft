import React, { useState } from 'react';

// ==============================================================================
// PIN OFFSETS
// Red (+) wire on top, Black (-) wire on bottom (Right side)
// ==============================================================================
export const LI_ION_PIN_OFFSETS = {
  VCC: { x: 110, y: 15 }, // Positive (Red)
  GND: { x: 110, y: 35 }  // Negative (Black)
};

/**
 * 18650 Li-Ion Battery Component
 * UPGRADE: Added a "Power LED" on the holder to indicate active state.
 */
const LiIonBattery = ({ onPinClick }) => {
  const [capacity, setCapacity] = useState(1000); // Default 1000mAh

  const handleCapacityChange = (e) => {
    e.stopPropagation();
    const newCap = prompt("Enter Battery Capacity (mAh):", capacity);
    if (newCap && !isNaN(newCap)) {
      setCapacity(parseInt(newCap, 10));
    }
  };

  return (
    <div style={{ position: 'relative', width: 110, height: 50 }}>
      
      {/* Main SVG Body */}
      <svg width="110" height="50" viewBox="0 0 110 50" style={{ overflow: 'visible' }}>
        
        {/* ─── WIRES ────────────────────────────────────────────────────── */}
        {/* Red Wire (+/VCC) */}
        <path d="M 90 15 L 110 15" stroke="#e74c3c" strokeWidth="3" fill="none" />
        {/* Black Wire (-/GND) */}
        <path d="M 90 35 L 110 35" stroke="#2d3436" strokeWidth="3" fill="none" />

        {/* ─── BATTERY HOLDER (Black Case) ──────────────────────────────── */}
        <rect x="0" y="5" width="95" height="40" rx="3" fill="#111" stroke="#333" strokeWidth="1" />
        
        {/*  */}
        
        {/* [SIMULATION VISUAL] Status LED */}
        {/* A small green light on the holder to show it's a live power source */}
        <circle cx="10" cy="25" r="2" fill="#2ecc71" />
        <circle cx="10" cy="25" r="4" fill="#2ecc71" opacity="0.3" />

        {/* ─── THE 18650 CELL (Blue Body) ───────────────────────────────── */}
        <rect x="15" y="8" width="70" height="34" rx="2" fill="#3498db" stroke="#2980b9" strokeWidth="1" />
        
        {/* Battery Details */}
        {/* Positive Button Top (Right side of cell) */}
        <rect x="85" y="15" width="4" height="20" fill="#bdc3c7" rx="1" />
        {/* Negative Flat Bottom (Left side of cell) */}
        <rect x="15" y="8" width="4" height="34" fill="#2980b9" rx="1" />
        
        {/* ─── CAPACITY LABEL (Interactive) ─────────────────────────────── */}
        <g 
          onClick={handleCapacityChange} 
          style={{ cursor: 'pointer' }}
        >
          <rect x="25" y="20" width="45" height="12" rx="2" fill="rgba(0,0,0,0.3)" />
          <text 
            x="47" y="29" 
            fill="#fff" 
            fontSize="8" 
            fontWeight="bold" 
            fontFamily="monospace" 
            textAnchor="middle" 
            style={{ pointerEvents: 'none' }}
          >
            {capacity}mAh
          </text>
          {/* Edit Icon Hint */}
          <text x="75" y="20" fontSize="8">✏️</text>
        </g>

        {/* ─── POLARITY MARKINGS ON HOLDER ──────────────────────────────── */}
        <text x="98" y="18" fill="#e74c3c" fontSize="10" fontWeight="bold">+</text>
        <text x="98" y="40" fill="#aaa" fontSize="12" fontWeight="bold">-</text>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* VCC (+ connection point) */}
        <circle 
          cx="110" cy="15" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }}
        />

        {/* GND (- connection point) */}
        <circle 
          cx="110" cy="35" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }}
        />

      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 10, left: 115, fontSize: 9, color: '#e74c3c', fontWeight: 'bold' }}>+</div>
      <div style={{ position: 'absolute', top: 30, left: 115, fontSize: 9, color: '#aaa', fontWeight: 'bold' }}>-</div>
    </div>
  );
};

export default LiIonBattery;