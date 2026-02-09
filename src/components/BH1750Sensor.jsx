import React from 'react';

// ==========================================
// BH1750 Metadata
// ==========================================
export const BH1750_PIN_OFFSETS = {
  'VCC':  { x: 90, y: 15 }, // Top Pin
  'GND':  { x: 90, y: 30 },
  'SCL':  { x: 90, y: 45 },
  'SDA':  { x: 90, y: 60 },
  'ADDR': { x: 90, y: 75 }  // Bottom Pin
};

export const BH1750_WIDTH = 100;
export const BH1750_HEIGHT = 80;

/**
 * BH1750 Light Sensor Component
 * UPGRADE: Accepts 'lux' prop to visually simulate light intensity.
 */
const BH1750Sensor = ({ scale = 1, onPinClick, lux = 0 }) => {
  // Calculate brightness glare (0.0 to 0.8 opacity) based on Lux (0-1000 range)
  const glareOpacity = Math.min(lux / 1200, 0.8);

  return (
    <svg 
      width={100} 
      height={80} 
      viewBox="0 0 100 80" 
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <filter id="bhShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Title */}
      <text x="50" y="-10" textAnchor="middle" fill="#ffffff" fontFamily="Arial" fontSize="11" fontWeight="bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        BH1750
      </text>

      {/* --- PCB Body --- */}
      <g filter="url(#bhShadow)">
        <rect x="5" y="5" width="90" height="75" rx="3" fill="#00509e" stroke="#003366" strokeWidth="1" />
        
        {/* Mounting Holes (Left Side) */}
        <circle cx="15" cy="15" r="4" fill="#222" stroke="#d4af37" strokeWidth="1.5" />
        <circle cx="15" cy="65" r="4" fill="#222" stroke="#d4af37" strokeWidth="1.5" />

        {/* ─── MAIN SENSOR CHIP ─────────────────────────────────────────── */}
        {/* Base dark chip */}
        <rect x="30" y="25" width="20" height="30" fill="#111" />
        
        {/* [SIMULATION VISUAL] Glare Overlay */}
        {/* This makes the chip look like it's under bright light */}
        <rect 
          x="30" y="25" width="20" height="30" 
          fill="#ffeb3b" 
          style={{ opacity: glareOpacity, transition: 'opacity 0.2s ease-out' }} 
        />
        
        {/* "BH1750" Text on Board */}
        <text x="40" y="45" textAnchor="middle" fill="#ccc" fontSize="6" fontFamily="monospace" transform="rotate(-90 40,45)" style={{pointerEvents:'none'}}>BH1750</text>

        {/* Decorative SMD Components */}
        <rect x="60" y="15" width="6" height="10" fill="#b8860b" />
        <rect x="60" y="35" width="6" height="10" fill="#b8860b" />
        <rect x="60" y="55" width="6" height="10" fill="#b8860b" />
      </g>

      {/* --- Pin Labels (Right Side) --- */}
      <text x="82" y="17" textAnchor="end" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">VCC</text>
      <text x="82" y="32" textAnchor="end" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">GND</text>
      <text x="82" y="47" textAnchor="end" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">SCL</text>
      <text x="82" y="62" textAnchor="end" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">SDA</text>
      <text x="82" y="77" textAnchor="end" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">ADDR</text>

      {/* --- Interactive Terminals --- */}

      {/* 1. VCC */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('VCC'); }} style={{ cursor: 'pointer' }}>
        <circle cx="90" cy="15" r="3.5" fill="#ff0000" stroke="white" strokeWidth="1" />
      </g>

      {/* 2. GND */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('GND'); }} style={{ cursor: 'pointer' }}>
        <circle cx="90" cy="30" r="3.5" fill="#000" stroke="white" strokeWidth="1" />
      </g>

      {/* 3. SCL */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('SCL'); }} style={{ cursor: 'pointer' }}>
        <circle cx="90" cy="45" r="3.5" fill="#00bcd4" stroke="white" strokeWidth="1" />
      </g>

      {/* 4. SDA */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('SDA'); }} style={{ cursor: 'pointer' }}>
        <circle cx="90" cy="60" r="3.5" fill="#00bcd4" stroke="white" strokeWidth="1" />
      </g>

      {/* 5. ADDR */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('ADDR'); }} style={{ cursor: 'pointer' }}>
        <circle cx="90" cy="75" r="3.5" fill="#f1c40f" stroke="white" strokeWidth="1" />
      </g>

    </svg>
  );
};

export default BH1750Sensor;