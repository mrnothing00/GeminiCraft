import React, { useState } from 'react';

// ==============================================================================
// PIN OFFSETS
// 2-Pin SPST Layout (Bottom)
// ==============================================================================
export const SWITCH_PIN_OFFSETS = {
  PIN1: { x: 20, y: 70 }, // Left Pin
  PIN2: { x: 60, y: 70 }  // Right Pin
};

/**
 * SPST Rocker Switch Component
 * UPGRADE: Illuminated switch face - glows when ON.
 */
const SwitchComponent = ({ onPinClick }) => {
  const [isOn, setIsOn] = useState(false);

  return (
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      
      {/* Main SVG Body */}
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gradOn" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff5252" /> {/* Bright Red Top */}
            <stop offset="100%" stopColor="#c0392b" /> {/* Darker Red Bottom */}
          </linearGradient>
          
          <linearGradient id="gradOff" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#922b21" /> {/* Dark Red Top */}
            <stop offset="100%" stopColor="#e74c3c" /> {/* Lighter Bottom */}
          </linearGradient>
          
          {/* Internal Glow Filter for ON state */}
          <filter id="switchGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* ─── LEGS (Pins) ──────────────────────────────────────────────── */}
        <line x1="20" y1="50" x2="20" y2="70" stroke="#ccc" strokeWidth="4" />
        <line x1="60" y1="50" x2="60" y2="70" stroke="#ccc" strokeWidth="4" />

        {/* ─── HOUSING (Black Body) ─────────────────────────────────────── */}
        {/* Main box */}
        <rect x="5" y="20" width="70" height="40" fill="#111" stroke="#000" strokeWidth="1" rx="2" />
        {/* Top Rim */}
        <rect x="0" y="15" width="80" height="10" fill="#222" stroke="#000" strokeWidth="1" rx="1" />

        {/* ─── ROCKER BUTTON (Red) ──────────────────────────────────────── */}
        <g 
          onClick={(e) => { e.stopPropagation(); setIsOn(!isOn); }} 
          style={{ cursor: 'pointer' }}
        >
          {/* Base Shape */}
          <rect x="10" y="18" width="60" height="30" fill="#c0392b" rx="2" stroke="#922b21" strokeWidth="1" />
          
          {isOn ? (
            // ON STATE (Tilted Down + Glowing)
            <g filter="url(#switchGlow)">
              <rect x="10" y="18" width="60" height="30" fill="url(#gradOn)" rx="2" />
              {/* Symbol 'I' (Line) highlighted */}
              <line x1="40" y1="25" x2="40" y2="35" stroke="#fff" strokeWidth="3" opacity="0.9" />
              <circle cx="40" cy="42" r="3" stroke="#fff" strokeWidth="2" fill="none" opacity="0.3" />
            </g>
          ) : (
            // OFF STATE (Tilted Up + Dark)
            <g>
              <rect x="10" y="18" width="60" height="30" fill="url(#gradOff)" rx="2" />
              {/* Symbol 'O' (Circle) highlighted */}
              <line x1="40" y1="25" x2="40" y2="35" stroke="#fff" strokeWidth="3" opacity="0.3" />
              <circle cx="40" cy="40" r="3" stroke="#fff" strokeWidth="2" fill="none" opacity="0.9" />
            </g>
          )}
        </g>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* Pin 1 */}
        <circle 
          cx="20" cy="70" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'PIN1'); }}
        />

        {/* Pin 2 */}
        <circle 
          cx="60" cy="70" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'PIN2'); }}
        />

      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 72, left: 15, fontSize: 9, color: '#aaa', fontWeight: 'bold' }}>1</div>
      <div style={{ position: 'absolute', top: 72, left: 55, fontSize: 9, color: '#aaa', fontWeight: 'bold' }}>2</div>
      
      {/* State Label */}
      <div style={{ 
        position: 'absolute', top: -15, left: 25, 
        fontSize: 9, fontWeight: 'bold', 
        color: isOn ? '#00e676' : '#ff5252',
        background: 'rgba(0,0,0,0.5)', padding: '1px 4px', borderRadius: 4,
        boxShadow: isOn ? '0 0 5px #00e676' : 'none'
      }}>
        {isOn ? 'ON' : 'OFF'}
      </div>
    </div>
  );
};

export default SwitchComponent;