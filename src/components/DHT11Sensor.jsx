import React from 'react';

// ==========================================
// DHT11 Metadata for Wiring System
// ==========================================
export const DHT11_PIN_OFFSETS = {
  'DATA': { x: 0,   y: 120 }, // Blue wire tip (Left)
  'VCC':  { x: 50,  y: 140 }, // Red wire tip (Bottom)
  'GND':  { x: 100, y: 120 }  // Black wire tip (Right)
};

export const DHT11_WIDTH = 100;
export const DHT11_HEIGHT = 150;

/**
 * DHT11 Sensor Component
 * UPGRADE: The blue grid changes color tint based on 'env.temperature'.
 */
const DHT11Sensor = ({ scale = 1, onPinClick, env }) => {
  // 1. Get Temperature from Simulation Environment
  const temp = env?.temperature ?? 25;

  // 2. Calculate Thermal Tint Overlay
  let tintColor = 'transparent';
  let tintOpacity = 0;

  if (temp > 30) {
    tintColor = '#ff4d4d'; // Red tint for Heat
    tintOpacity = 0.4;
  } else if (temp < 15) {
    tintColor = '#ffffff'; // White tint for Cold
    tintOpacity = 0.4;
  }

  return (
    <svg 
      width={100} 
      height={150} 
      viewBox="0 0 100 150" 
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        {/* Pattern for the blue sensor grid */}
        <pattern id="dhtGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#00d2ff" />
          <rect x="2" y="2" width="6" height="6" fill="#00b0e6" rx="1" />
        </pattern>
        {/* Drop shadow filter */}
        <filter id="sensorShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.5"/>
        </filter>
      </defs>

      {/* --- Main Title --- */}
      <text x="50" y="15" textAnchor="middle" fill="#00d2ff" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold">
        DHT11
      </text>

      {/* --- Body Group --- */}
      <g filter="url(#sensorShadow)">
        {/* Black PCB Board Base */}
        <rect x="20" y="55" width="60" height="40" rx="3" fill="#222" stroke="#111" strokeWidth="1" />
        
        {/* Blue Sensor Module */}
        <rect x="25" y="25" width="50" height="55" rx="2" fill="url(#dhtGrid)" stroke="#009ecf" strokeWidth="1" />

        {/* [SIMULATION VISUAL] Thermal Tint Overlay */}
        {/* Overlays a color on the grid to show Heat/Cold */}
        <rect 
          x="25" y="25" width="50" height="55" rx="2" 
          fill={tintColor} 
          style={{ opacity: tintOpacity, transition: 'background-color 0.3s, opacity 0.3s' }} 
          pointerEvents="none"
        />
      </g>

      {/* PCB Markings */}
      <text x="26" y="90" fill="#888" fontSize="9" fontFamily="monospace" fontWeight="bold">S</text>
      <text x="74" y="90" fill="#888" fontSize="9" fontFamily="monospace" fontWeight="bold">-</text>

      {/* --- Metal Pins --- */}
      <line x1="35" y1="95" x2="35" y2="105" stroke="#ccc" strokeWidth="3" />
      <line x1="50" y1="95" x2="50" y2="105" stroke="#ccc" strokeWidth="3" />
      <line x1="65" y1="95" x2="65" y2="105" stroke="#ccc" strokeWidth="3" />

      {/* --- Interactive Wires & Labels --- */}

      {/* 1. DATA (Blue Wire - Left) */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('DATA'); }} style={{ cursor: 'pointer' }}>
        <path d="M 35 105 L 35 120 L 0 120" fill="none" stroke="#007bff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="120" r="3.5" fill="#007bff" stroke="white" strokeWidth="1" />
        <text x="-5" y="124" textAnchor="end" fill="#007bff" fontSize="11" fontWeight="bold" fontFamily="Arial">DATA</text>
      </g>

      {/* 2. VCC (Red Wire - Down) */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('VCC'); }} style={{ cursor: 'pointer' }}>
        <path d="M 50 105 L 50 140" fill="none" stroke="#ff0000" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="140" r="3.5" fill="#ff0000" stroke="white" strokeWidth="1" />
        <text x="50" y="152" textAnchor="middle" fill="#ff0000" fontSize="11" fontWeight="bold" fontFamily="Arial">VCC</text>
      </g>

      {/* 3. GND (Black Wire - Right) */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('GND'); }} style={{ cursor: 'pointer' }}>
        <path d="M 65 105 L 65 120 L 100 120" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="120" r="3.5" fill="#000" stroke="white" strokeWidth="1" />
        <text x="105" y="124" textAnchor="start" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial">GND</text>
      </g>

    </svg>
  );
};

export default DHT11Sensor;