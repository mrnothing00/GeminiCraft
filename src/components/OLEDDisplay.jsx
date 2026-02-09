import React from 'react';

// ==============================================================================
// PIN OFFSETS
// Based on the 7-Pin SPI Layout in your image (Left to Right)
// ==============================================================================
export const OLED_PIN_OFFSETS = {
  GND: { x: 15, y: 15 },
  VCC: { x: 27, y: 15 },
  D0:  { x: 39, y: 15 }, // CLK
  D1:  { x: 51, y: 15 }, // MOSI
  RES: { x: 63, y: 15 }, // Reset
  DC:  { x: 75, y: 15 }, // Data/Command
  CS:  { x: 87, y: 15 }  // Chip Select
};

/**
 * 0.96" SPI OLED Display
 * UPGRADE: Screen glows when 'isOn' and shows custom text.
 */
const OLEDDisplay = ({ onPinClick, isOn = false, text = "Hello World" }) => {
  return (
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      
      {/* Main SVG Body */}
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        
        {/* ─── PINS (Top Header) ────────────────────────────────────────── */}
        <line x1="15" y1="0" x2="15" y2="15" stroke="#ccc" strokeWidth="2" />
        <line x1="27" y1="0" x2="27" y2="15" stroke="#ccc" strokeWidth="2" />
        <line x1="39" y1="0" x2="39" y2="15" stroke="#ccc" strokeWidth="2" />
        <line x1="51" y1="0" x2="51" y2="15" stroke="#ccc" strokeWidth="2" />
        <line x1="63" y1="0" x2="63" y2="15" stroke="#ccc" strokeWidth="2" />
        <line x1="75" y1="0" x2="75" y2="15" stroke="#ccc" strokeWidth="2" />
        <line x1="87" y1="0" x2="87" y2="15" stroke="#ccc" strokeWidth="2" />

        {/* ─── PCB BOARD (Blue) ─────────────────────────────────────────── */}
        <rect x="0" y="15" width="100" height="85" rx="4" fill="#004080" stroke="#002040" strokeWidth="1" />
        
        {/* Mounting Holes */}
        <circle cx="5" cy="20" r="2.5" fill="#e0e0e0" />
        <circle cx="95" cy="20" r="2.5" fill="#e0e0e0" />
        <circle cx="5" cy="95" r="2.5" fill="#e0e0e0" />
        <circle cx="95" cy="95" r="2.5" fill="#e0e0e0" />

        {/* ─── SCREEN AREA (Black Glass) ────────────────────────────────── */}
        <rect x="10" y="35" width="80" height="50" rx="1" fill="#000" stroke="#333" strokeWidth="1" />
        
        {/* [SIMULATION VISUAL] Active Screen Content */}
        {isOn ? (
          <g>
            {/* Screen Glow */}
            <rect x="12" y="37" width="76" height="46" fill="#001a1a" />
            <text x="15" y="50" fill="#00ffcc" fontSize="8" fontFamily="monospace" style={{ textShadow: '0 0 2px #00ffcc' }}>
              {text}
            </text>
            {/* Animated pixel noise (optional, keeps it alive) */}
            <rect x="12" y="37" width="76" height="46" fill="url(#pixelNoise)" opacity="0.1" />
          </g>
        ) : (
          /* Off State Reflection */
          <path d="M 10 35 L 40 35 L 10 65 Z" fill="#ffffff" opacity="0.1" />
        )}

        {/* ─── PIN LABELS (Small text on PCB) ───────────────────────────── */}
        <g fontSize="5" fill="#fff" textAnchor="middle" fontWeight="bold">
          <text x="15" y="28">GND</text>
          <text x="27" y="28">VCC</text>
          <text x="39" y="28">D0</text>
          <text x="51" y="28">D1</text>
          <text x="63" y="28">RES</text>
          <text x="75" y="28">DC</text>
          <text x="87" y="28">CS</text>
        </g>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        <circle cx="15" cy="15" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }} />
        <circle cx="27" cy="15" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }} />
        <circle cx="39" cy="15" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'D0'); }} />
        <circle cx="51" cy="15" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'D1'); }} />
        <circle cx="63" cy="15" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'RES'); }} />
        <circle cx="75" cy="15" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'DC'); }} />
        <circle cx="87" cy="15" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'CS'); }} />

      </svg>
    </div>
  );
};

export default OLEDDisplay;