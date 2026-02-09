import React from 'react';

// ==========================================
// DHT22 Metadata for Wiring System
// ==========================================
export const DHT22_PIN_OFFSETS = {
  'VCC':  { x: 0,   y: 140 }, // Red wire tip (Left)
  'DATA': { x: 50,  y: 155 }, // Blue wire tip (Bottom)
  'GND':  { x: 100, y: 140 }  // Black wire tip (Right)
};

export const DHT22_WIDTH = 100;
export const DHT22_HEIGHT = 160;

/**
 * DHT22 / AM2302 Sensor Component
 * UPGRADE: White casing tints slightly Red (Hot) or Cyan (Cold).
 */
const DHT22Sensor = ({ scale = 1, onPinClick, env }) => {
  // 1. Get Temperature from Simulation Environment
  const temp = env?.temperature ?? 25;

  // 2. Calculate Tint for White Casing
  let casingTint = '#f0f0f0'; // Default White
  
  if (temp > 35) {
    casingTint = '#ffebee'; // Slight Reddish (Heat)
  } else if (temp < 10) {
    casingTint = '#e0f7fa'; // Slight Cyan (Cold/Frost)
  }

  return (
    <svg 
      width={100} 
      height={160} 
      viewBox="0 0 100 160" 
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <filter id="sensorShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* --- Main Title (Moved UP to y=-10) --- */}
      <text x="50" y="-10" textAnchor="middle" fill="#ffffff" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        DHT22
      </text>

      {/* --- Body Group --- */}
      <g filter="url(#sensorShadow)">
        {/* Black PCB Board Base */}
        <rect x="25" y="100" width="50" height="25" fill="#111" stroke="#000" strokeWidth="1" />
        {/* Screw Hole on PCB */}
        <circle cx="50" cy="112" r="6" fill="#444" stroke="#666" strokeWidth="2" />

        {/* [SIMULATION VISUAL] White Plastic Casing with Dynamic Tint */}
        <path d="M 25 35 L 75 35 L 75 100 L 25 100 Z" fill={casingTint} stroke="#ccc" strokeWidth="1" style={{ transition: 'fill 0.5s' }} />
        <path d="M 25 35 A 10 10 0 0 1 75 35" fill={casingTint} stroke="#ccc" strokeWidth="1" style={{ transition: 'fill 0.5s' }} />
        
        {/* Top Mounting Hole */}
        <circle cx="50" cy="30" r="4" fill="#fff" stroke="#ccc" strokeWidth="1" />

        {/* Grill Pattern (4x5 Grid) */}
        <g fill="#333" opacity="0.8">
          {[0, 1, 2, 3, 4].map(row => (
            <React.Fragment key={row}>
              {[0, 1, 2, 3].map(col => (
                <rect key={`${row}-${col}`} x={32 + col * 10} y={45 + row * 10} width="6" height="6" rx="1" />
              ))}
            </React.Fragment>
          ))}
        </g>
        
        {/* Text Markings */}
        <text x="50" y="96" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#666">AOSONG AM2302</text>
        <text x="35" y="122" textAnchor="middle" fontSize="6" fontFamily="Arial" fill="#fff" fontWeight="bold">+</text>
        <text x="50" y="122" textAnchor="middle" fontSize="6" fontFamily="Arial" fill="#fff" fontWeight="bold">OUT</text>
        <text x="65" y="122" textAnchor="middle" fontSize="6" fontFamily="Arial" fill="#fff" fontWeight="bold">-</text>
      </g>

      {/* --- Pins --- */}
      <line x1="35" y1="125" x2="35" y2="130" stroke="#ccc" strokeWidth="3" />
      <line x1="50" y1="125" x2="50" y2="130" stroke="#ccc" strokeWidth="3" />
      <line x1="65" y1="125" x2="65" y2="130" stroke="#ccc" strokeWidth="3" />

      {/* --- Interactive Wires & Labels --- */}

      {/* 1. VCC (Red Wire - Left) */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('VCC'); }} style={{ cursor: 'pointer' }}>
        <path d="M 35 130 L 35 140 L 0 140" fill="none" stroke="#d63031" strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="140" r="3.5" fill="#d63031" stroke="white" strokeWidth="1" />
        <text x="-5" y="144" textAnchor="end" fill="#d63031" fontSize="11" fontWeight="bold" fontFamily="Arial">VCC</text>
      </g>

      {/* 2. DATA (Blue Wire - Down) */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('DATA'); }} style={{ cursor: 'pointer' }}>
        <path d="M 50 130 L 50 155" fill="none" stroke="#0984e3" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="155" r="3.5" fill="#0984e3" stroke="white" strokeWidth="1" />
        <text x="50" y="168" textAnchor="middle" fill="#0984e3" fontSize="11" fontWeight="bold" fontFamily="Arial">DATA</text>
      </g>

      {/* 3. GND (Black Wire - Right) */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('GND'); }} style={{ cursor: 'pointer' }}>
        <path d="M 65 130 L 65 140 L 100 140" fill="none" stroke="#2d3436" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="140" r="3.5" fill="#2d3436" stroke="white" strokeWidth="1" />
        <text x="105" y="144" textAnchor="start" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial">GND</text>
      </g>

    </svg>
  );
};

export default DHT22Sensor;