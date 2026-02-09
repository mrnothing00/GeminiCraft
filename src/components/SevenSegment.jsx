import React from 'react';

// ==============================================================================
// PIN OFFSETS
// Based on the 5-pin header on the LEFT side of the board.
// ==============================================================================
export const SEVEN_SEG_PIN_OFFSETS = {
  VCC: { x: 10, y: 15 },
  GND: { x: 10, y: 25 },
  DIN: { x: 10, y: 35 },
  CS:  { x: 10, y: 45 },
  CLK: { x: 10, y: 55 }
};

/**
 * MAX7219 8-Digit 7-Segment Display
 * UPGRADE: Accepts 'value' prop to display real numbers/text with a red glow.
 */
const SevenSegment = ({ onPinClick, isOn = false, value = "12345678" }) => {
  
  // Ensure value fits the 8-digit display (pad or slice)
  const displayValue = (value || "").toString().slice(0, 8).padStart(8, ' ');

  return (
    <div style={{ position: 'relative', width: 200, height: 60 }}>
      
      {/* Main SVG Body */}
      <svg width="200" height="60" viewBox="0 0 200 60" style={{ overflow: 'visible' }}>
        
        {/* ─── PCB BOARD (Blue) ─────────────────────────────────────────── */}
        <rect x="0" y="5" width="200" height="50" rx="2" fill="#005080" stroke="#003060" strokeWidth="1" />
        
        {/* Mounting Holes */}
        <circle cx="10" cy="10" r="2" fill="#eee" />
        <circle cx="190" cy="10" r="2" fill="#eee" />
        <circle cx="190" cy="50" r="2" fill="#eee" />
        <circle cx="10" cy="50" r="2" fill="#eee" />

        {/* ─── 8-DIGIT DISPLAY BLOCK (Black Glass) ──────────────────────── */}
        <rect x="25" y="10" width="150" height="40" fill="#111" stroke="#333" strokeWidth="1" />

        {/* ─── BACKGROUND SEGMENTS (Unlit '8.8.8...') ───────────────────── */}
        {/* This gives the realistic "off" segment look */}
        <g transform="translate(32, 40)" fill="#222" fontFamily="monospace" fontSize="30" fontWeight="bold" letterSpacing="11px">
           <text>88888888</text>
        </g>

        {/* ─── [SIMULATION VISUAL] ACTIVE DIGITS ────────────────────────── */}
        {/* The glowing red numbers */}
        {isOn && (
          <g transform="translate(32, 40)" fill="#ff0000" fontFamily="monospace" fontSize="30" fontWeight="bold" letterSpacing="11px" style={{ textShadow: "0 0 5px red" }}>
             <text>{displayValue}</text>
          </g>
        )}

        {/* ─── PIN HEADER (Left Side) ───────────────────────────────────── */}
        <rect x="5" y="12" width="10" height="46" fill="#222" rx="1" />
        
        {/* Metal Pins */}
        <rect x="0" y="14" width="6" height="2" fill="#ccc" /> {/* VCC */}
        <rect x="0" y="24" width="6" height="2" fill="#ccc" /> {/* GND */}
        <rect x="0" y="34" width="6" height="2" fill="#ccc" /> {/* DIN */}
        <rect x="0" y="44" width="6" height="2" fill="#ccc" /> {/* CS */}
        <rect x="0" y="54" width="6" height="2" fill="#ccc" /> {/* CLK */}

        {/* ─── PIN LABELS ───────────────────────────────────────────────── */}
        <text x="18" y="17" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="bold">VCC</text>
        <text x="18" y="27" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="bold">GND</text>
        <text x="18" y="37" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="bold">DIN</text>
        <text x="18" y="47" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="bold">CS</text>
        <text x="18" y="57" fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="bold">CLK</text>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        <circle cx="5" cy="15" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }} />
        <circle cx="5" cy="25" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }} />
        <circle cx="5" cy="35" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'DIN'); }} />
        <circle cx="5" cy="45" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'CS'); }} />
        <circle cx="5" cy="55" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'CLK'); }} />

      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 12, left: -20, fontSize: 8, color: '#e74c3c', fontWeight: 'bold' }}>VCC</div>
      <div style={{ position: 'absolute', top: 22, left: -20, fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>GND</div>
      <div style={{ position: 'absolute', top: 32, left: -20, fontSize: 8, color: '#e67e22', fontWeight: 'bold' }}>DIN</div>
      <div style={{ position: 'absolute', top: 42, left: -15, fontSize: 8, color: '#3498db', fontWeight: 'bold' }}>CS</div>
      <div style={{ position: 'absolute', top: 52, left: -20, fontSize: 8, color: '#2ecc71', fontWeight: 'bold' }}>CLK</div>
    </div>
  );
};

export default SevenSegment;