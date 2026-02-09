import React from 'react';

// ==========================================
// LDR (Light Dependent Resistor) Metadata
// ==========================================
export const LDR_PIN_OFFSETS = {
  'PIN1': { x: 20, y: 80 }, // Left Leg
  'PIN2': { x: 40, y: 80 }  // Right Leg
};

export const LDR_WIDTH = 60;
export const LDR_HEIGHT = 80;

/**
 * LDR Component
 * UPGRADE: Sensor face glows based on 'env.lux' light level.
 */
const LDRSensor = ({ scale = 1, onPinClick, env }) => {
  // 1. Get Lux from Simulation Environment (Default 500)
  const lux = env?.lux ?? 500;
  
  // 2. Calculate Glare Opacity (0.0 dark -> 0.8 bright sunlight)
  const glareOpacity = Math.min(lux / 1200, 0.8);

  return (
    <svg 
      width={60} 
      height={80} 
      viewBox="0 0 60 80" 
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <filter id="ldrShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Title */}
      <text x="30" y="-10" textAnchor="middle" fill="#ffffff" fontFamily="Arial" fontSize="10" fontWeight="bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        LDR
      </text>

      {/* --- Body --- */}
      <g filter="url(#ldrShadow)">
        {/* Legs */}
        <line x1="20" y1="30" x2="20" y2="80" stroke="#ccc" strokeWidth="2" />
        <line x1="40" y1="30" x2="40" y2="80" stroke="#ccc" strokeWidth="2" />

        {/* Head Substrate (Orange base) */}
        <ellipse cx="30" cy="20" rx="22" ry="12" fill="#e67e22" stroke="#d35400" strokeWidth="1" />
        
        {/* Face (White/Grey top) */}
        <ellipse cx="30" cy="18" rx="18" ry="10" fill="#ecf0f1" />

        {/* [SIMULATION VISUAL] Light Glare Overlay */}
        {/* Makes the sensor look like it's in bright light */}
        <ellipse 
          cx="30" cy="18" rx="18" ry="10" 
          fill="#ffeb3b" 
          style={{ opacity: glareOpacity, transition: 'opacity 0.2s' }} 
        />

        {/* Zig-Zag Pattern (The photo-sensitive material)  */}
        <path 
          d="M 20 12 L 40 12 L 20 16 L 40 16 L 20 20 L 40 20 L 20 24 L 40 24" 
          fill="none" 
          stroke="#e74c3c" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.8"
        />
      </g>

      {/* --- Interactive Terminals --- */}

      {/* 1. PIN 1 (Left) */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('PIN1'); }} style={{ cursor: 'pointer' }}>
        <circle cx="20" cy="80" r="3" fill="#ccc" stroke="white" strokeWidth="1" />
        <text x="15" y="75" textAnchor="end" fill="#aaa" fontSize="8" fontFamily="monospace">1</text>
      </g>

      {/* 2. PIN 2 (Right) */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('PIN2'); }} style={{ cursor: 'pointer' }}>
        <circle cx="40" cy="80" r="3" fill="#ccc" stroke="white" strokeWidth="1" />
        <text x="45" y="75" textAnchor="start" fill="#aaa" fontSize="8" fontFamily="monospace">2</text>
      </g>

    </svg>
  );
};

export default LDRSensor;