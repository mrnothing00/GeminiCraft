import React from 'react';

// ==========================================
// DC Motor Metadata
// ==========================================
export const DC_MOTOR_PIN_OFFSETS = {
  // Adjusted x to 88 to match the visual SVG pin location exactly
  'VCC': { x: 88, y: 30 }, // Positive (Red)
  'GND': { x: 88, y: 50 }  // Negative (Black)
};

export const DC_MOTOR_WIDTH = 90;
export const DC_MOTOR_HEIGHT = 60;

/**
 * 5V DC Motor Component
 * Visuals: Silver cylindrical body, spinning shaft on left.
 * FIX: Passed 'e' (event) correctly to onPinClick so wiring works.
 */
const DCMotor = ({ scale = 1, onPinClick, isOn = false }) => {
  return (
    <svg 
      width={90} 
      height={60} 
      viewBox="0 0 90 60" 
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <filter id="motorShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4"/>
        </filter>
        
        {/* Metallic Body Gradient */}
        <linearGradient id="silverBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#eee" />
          <stop offset="20%" stopColor="#ccc" />
          <stop offset="50%" stopColor="#fff" />
          <stop offset="80%" stopColor="#999" />
          <stop offset="100%" stopColor="#666" />
        </linearGradient>
        
        {/* Shaft Gradient */}
        <linearGradient id="shaftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ddd" />
          <stop offset="100%" stopColor="#888" />
        </linearGradient>
        
        {/* Animation Definition */}
        <style>
          {`@keyframes motorSpin { 
              from { transform: rotate(0deg); } 
              to { transform: rotate(360deg); } 
            }`}
        </style>
      </defs>

      {/* Title */}
      <text x="45" y="-10" textAnchor="middle" fill="#ffffff" fontFamily="Arial" fontSize="11" fontWeight="bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        DC Motor
      </text>

      {/* --- ROTATING SHAFT GROUP --- */}
      <g 
        style={{ 
          transformOrigin: '7.5px 30px', // Exact center of shaft
          animation: isOn ? 'motorSpin 0.1s linear infinite' : 'none' 
        }}
      >
        {/* The Shaft itself */}
        <rect x="0" y="27" width="15" height="6" fill="url(#shaftGrad)" />
        
        {/* Propeller/Notch (Visual spinner) */}
        <rect x="6" y="24" width="3" height="12" fill="#333" rx="1" opacity="0.8" />

        {/* [SIMULATION VISUAL] Motion Blur Circle */}
        {isOn && (
          <circle cx="7.5" cy="30" r="10" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
        )}
      </g>

      {/* --- STATIC BUSHING --- */}
      <rect x="15" y="22" width="5" height="16" fill="#444" rx="1" />

      {/* --- MAIN BODY (Static) --- */}
      <g filter="url(#motorShadow)">
        <rect x="20" y="10" width="55" height="40" rx="2" fill="url(#silverBody)" stroke="#999" strokeWidth="1" />
        
        {/* Back Cap (Plastic) */}
        <path d="M 75 10 L 85 15 L 85 45 L 75 50 Z" fill="#222" />
        
        {/* Ventilation Slits */}
        <line x1="30" y1="15" x2="65" y2="15" stroke="#aaa" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="45" x2="65" y2="45" stroke="#aaa" strokeWidth="1" opacity="0.5" />
      </g>

      {/* --- INTERACTIVE TERMINALS (Right Side) --- */}

      {/* 1. Positive Terminal (Red) */}
      {/* Added larger transparent rect for easier clicking */}
      <g 
        onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }} 
        style={{ cursor: 'pointer' }}
      >
        {/* Hitbox */}
        <rect x="80" y="20" width="20" height="20" fill="transparent" />
        
        {/* Visuals */}
        <rect x="85" y="28" width="5" height="4" fill="#d4af37" />
        <circle cx="88" cy="30" r="3" fill="#ff0000" stroke="white" strokeWidth="1" />
        <text x="88" y="22" textAnchor="middle" fill="#ff0000" fontSize="10" fontWeight="bold">+</text>
      </g>

      {/* 2. Negative Terminal (Black) */}
      <g 
        onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }} 
        style={{ cursor: 'pointer' }}
      >
        {/* Hitbox */}
        <rect x="80" y="40" width="20" height="20" fill="transparent" />

        {/* Visuals */}
        <rect x="85" y="48" width="5" height="4" fill="#d4af37" />
        <circle cx="88" cy="50" r="3" fill="#000" stroke="white" strokeWidth="1" />
        <text x="88" y="62" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">-</text>
      </g>

    </svg>
  );
};

export default DCMotor;