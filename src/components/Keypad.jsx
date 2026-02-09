import React, { useState } from 'react';

// ==============================================================================
// PIN OFFSETS
// Standard 8-pin header. 
// Pin 1=R1, 2=R2, 3=R3, 4=R4, 5=C1, 6=C2, 7=C3, 8=C4
// ==============================================================================
export const KEYPAD_PIN_OFFSETS = {
  R1: { x: 35, y: 155 },
  R2: { x: 45, y: 155 },
  R3: { x: 55, y: 155 },
  R4: { x: 65, y: 155 },
  C1: { x: 75, y: 155 },
  C2: { x: 85, y: 155 },
  C3: { x: 95, y: 155 },
  C4: { x: 105, y: 155 }
};

const KEYS = [
  { label: '1', row: 0, col: 0, type: 'NUM' }, { label: '2', row: 0, col: 1, type: 'NUM' }, { label: '3', row: 0, col: 2, type: 'NUM' }, { label: 'A', row: 0, col: 3, type: 'CHAR' },
  { label: '4', row: 1, col: 0, type: 'NUM' }, { label: '5', row: 1, col: 1, type: 'NUM' }, { label: '6', row: 1, col: 2, type: 'NUM' }, { label: 'B', row: 1, col: 3, type: 'CHAR' },
  { label: '7', row: 2, col: 0, type: 'NUM' }, { label: '8', row: 2, col: 1, type: 'NUM' }, { label: '9', row: 2, col: 2, type: 'NUM' }, { label: 'C', row: 2, col: 3, type: 'CHAR' },
  { label: '*', row: 3, col: 0, type: 'CHAR' }, { label: '0', row: 3, col: 1, type: 'NUM' }, { label: '#', row: 3, col: 2, type: 'CHAR' }, { label: 'D', row: 3, col: 3, type: 'CHAR' },
];

const COLORS = {
  NUM: { bg: '#3498db', border: '#2980b9' },   // Blue for Numbers
  CHAR: { bg: '#e74c3c', border: '#c0392b' }   // Red for Letters/Symbols
};

const Keypad = ({ onPinClick }) => {
  const [pressedKey, setPressedKey] = useState(null);

  return (
    <div style={{ position: 'relative', width: 140, height: 160 }}>
      
      {/* Main SVG Body */}
      <svg width="140" height="160" viewBox="0 0 140 160" style={{ overflow: 'visible' }}>
        
        {/* ─── RIBBON CABLE ─────────────────────────────────────────────── */}
        <defs>
          <pattern id="ribbonStripes" x="0" y="0" width="4" height="10" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="3" height="10" fill="#f1c40f" opacity="0.3" />
            <rect x="3" y="0" width="1" height="10" fill="#d35400" opacity="0.1" />
          </pattern>
        </defs>
        
        {/* Cable background */}
        <rect x="35" y="100" width="70" height="40" fill="#2c3e50" opacity="0.1" /> 
        <rect x="40" y="100" width="60" height="40" fill="url(#ribbonStripes)" />
        
        {/* ─── CONNECTOR HEADER (The Black Square) ──────────────────────── */}
        <rect x="30" y="140" width="80" height="15" fill="#111" rx="1" />

        {/* ─── PIN LABELS (R1-R4, C1-C4) ────────────────────────────────── */}
        <g fill="#fff" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>
          <text x="35" y="150">R1</text>
          <text x="45" y="150">R2</text>
          <text x="55" y="150">R3</text>
          <text x="65" y="150">R4</text>
          <text x="75" y="150">C1</text>
          <text x="85" y="150">C2</text>
          <text x="95" y="150">C3</text>
          <text x="105" y="150">C4</text>
        </g>

        {/* ─── KEYPAD BODY ──────────────────────────────────────────────── */}
        <rect x="5" y="5" width="130" height="110" rx="6" fill="#111" stroke="#333" strokeWidth="2" />
        <rect x="8" y="8" width="124" height="104" rx="4" fill="none" stroke="#555" strokeWidth="1" />

        {/* ─── KEYS ─────────────────────────────────────────────────────── */}
        {KEYS.map((k, i) => {
          const x = 15 + k.col * 30;
          const y = 15 + k.row * 25;
          const isPressed = pressedKey === k.label;
          const color = COLORS[k.type];

          return (
            <g 
              key={i} 
              transform={`translate(${x}, ${y})`}
              onMouseDown={(e) => { e.stopPropagation(); setPressedKey(k.label); }}
              onMouseUp={(e) => { e.stopPropagation(); setPressedKey(null); }}
              onMouseLeave={() => setPressedKey(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Button Base */}
              <rect 
                x="0" y="0" width="24" height="20" rx="3" 
                fill={isPressed ? color.border : color.bg} 
                stroke={color.border} 
                strokeWidth="1" 
                filter={isPressed ? "" : "drop-shadow(0 2px 0px rgba(0,0,0,0.5))"}
                transform={isPressed ? "translate(0, 2)" : "translate(0, 0)"}
              />
              {/* Label */}
              <text 
                x="12" y="14" 
                fill="#fff" 
                fontSize="10" 
                fontWeight="bold" 
                fontFamily="sans-serif" 
                textAnchor="middle" 
                pointerEvents="none"
                transform={isPressed ? "translate(0, 2)" : "translate(0, 0)"}
              >
                {k.label}
              </text>
            </g>
          );
        })}

        {/* ─── PINS (Bottom of Ribbon) ──────────────────────────────────── */}
        {/* R1-R4 */}
        <rect x="34" y="155" width="2" height="5" fill="#ccc" />
        <rect x="44" y="155" width="2" height="5" fill="#ccc" />
        <rect x="54" y="155" width="2" height="5" fill="#ccc" />
        <rect x="64" y="155" width="2" height="5" fill="#ccc" />
        {/* C1-C4 */}
        <rect x="74" y="155" width="2" height="5" fill="#ccc" />
        <rect x="84" y="155" width="2" height="5" fill="#ccc" />
        <rect x="94" y="155" width="2" height="5" fill="#ccc" />
        <rect x="104" y="155" width="2" height="5" fill="#ccc" />

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        <circle cx="35" cy="155" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick('R1'); }} />
        <circle cx="45" cy="155" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick('R2'); }} />
        <circle cx="55" cy="155" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick('R3'); }} />
        <circle cx="65" cy="155" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick('R4'); }} />
        
        <circle cx="75" cy="155" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick('C1'); }} />
        <circle cx="85" cy="155" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick('C2'); }} />
        <circle cx="95" cy="155" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick('C3'); }} />
        <circle cx="105" cy="155" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick('C4'); }} />

      </svg>

      {/* ─── PRESSED STATUS INDICATOR ───────────────────────────────────── */}
      {pressedKey && (
        <div style={{ 
          position: 'absolute', top: -25, left: 35, 
          background: '#00e676', color: '#000', 
          padding: '4px 8px', borderRadius: 4, 
          fontSize: 11, fontWeight: 'bold',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
        }}>
          Key: {pressedKey}
        </div>
      )}
    </div>
  );
};

export default Keypad;