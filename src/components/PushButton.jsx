import React, { useState } from 'react';

// ==============================================================================
// PIN OFFSETS
// 4-Pin Layout: Top-Left, Top-Right, Bottom-Left, Bottom-Right
// ==============================================================================
export const PUSHBUTTON_PIN_OFFSETS = {
  TL: { x: 10, y: 10 }, // Top Left (Connected to TR)
  TR: { x: 70, y: 10 }, // Top Right (Connected to TL)
  BL: { x: 10, y: 70 }, // Bottom Left (Connected to BR)
  BR: { x: 70, y: 70 }  // Bottom Right (Connected to BL)
};

/**
 * Tactile Push Button Component
 * UPGRADE: Visual "Click" effect and button depression animation.
 */
const PushButton = ({ onPinClick }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      
      {/* Main SVG Body */}
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ overflow: 'visible' }}>
        
        {/* ─── LEGS (Pins) ──────────────────────────────────────────────── */}
        {/* Top Legs */}
        <line x1="10" y1="10" x2="25" y2="25" stroke="#ccc" strokeWidth="3" />
        <line x1="70" y1="10" x2="55" y2="25" stroke="#ccc" strokeWidth="3" />
        
        {/* Bottom Legs */}
        <line x1="10" y1="70" x2="25" y2="55" stroke="#ccc" strokeWidth="3" />
        <line x1="70" y1="70" x2="55" y2="55" stroke="#ccc" strokeWidth="3" />

        {/* ─── BODY (Square) ────────────────────────────────────────────── */}
        <rect x="20" y="20" width="40" height="40" rx="2" fill="#2d3436" stroke="#000" strokeWidth="1" />
        
        {/* Metal Cover Plate */}
        <rect x="22" y="22" width="36" height="36" rx="1" fill="#b2bec3" stroke="#636e72" strokeWidth="1" />
        
        {/* ─── BUTTON (Circle) ──────────────────────────────────────────── */}
        <g 
          onMouseDown={(e) => { e.stopPropagation(); setIsPressed(true); }}
          onMouseUp={(e) => { e.stopPropagation(); setIsPressed(false); }}
          onMouseLeave={() => setIsPressed(false)}
          style={{ cursor: 'pointer' }}
        >
          {/* Main Button Cap */}
          <circle 
            cx="40" cy="40" 
            r={isPressed ? 11 : 12} // Shrink on press
            fill={isPressed ? "#1e272e" : "#2d3436"} 
            stroke="#000" strokeWidth="1"
            style={{ transition: 'all 0.05s ease-out' }}
          />
          
          {/* Button Highlight (Reflection) */}
          {!isPressed && <ellipse cx="36" cy="36" rx="4" ry="2" fill="#fff" opacity="0.2" transform="rotate(-45 36 36)" pointerEvents="none" />}
        </g>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* Top Left */}
        <circle 
          cx="10" cy="10" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'TL'); }}
        />

        {/* Top Right */}
        <circle 
          cx="70" cy="10" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'TR'); }}
        />

        {/* Bottom Left */}
        <circle 
          cx="10" cy="70" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'BL'); }}
        />

        {/* Bottom Right */}
        <circle 
          cx="70" cy="70" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'BR'); }}
        />

      </svg>

      {/* ─── VISUAL CLICK FEEDBACK ──────────────────────────────────────── */}
      {isPressed && (
        <div style={{
          position: 'absolute', top: 30, left: 85,
          color: '#00e676', fontWeight: 'bold', fontSize: '10px',
          animation: 'fadeOut 0.5s forwards'
        }}>
          CLICK!
        </div>
      )}

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: -5, left: 8, fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>1</div>
      <div style={{ position: 'absolute', top: -5, left: 68, fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>1</div>
      <div style={{ position: 'absolute', top: 72, left: 8, fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>2</div>
      <div style={{ position: 'absolute', top: 72, left: 68, fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>2</div>
    </div>
  );
};

export default PushButton;