import React from 'react';

// ==========================================
// BMP280 Metadata
// ==========================================
export const BMP280_PIN_OFFSETS = {
  'VCC': { x: 15, y: 100 }, // Pin 1
  'GND': { x: 30, y: 100 }, // Pin 2
  'SCL': { x: 45, y: 100 }, // Pin 3
  'SDA': { x: 60, y: 100 }, // Pin 4
  'CSB': { x: 75, y: 100 }, // Pin 5
  'SDO': { x: 90, y: 100 }  // Pin 6
};

export const BMP280_WIDTH = 105;
export const BMP280_HEIGHT = 110;

/**
 * BMP280 Pressure Sensor Component
 * UPGRADE: Accepts 'env' prop to visualize pressure status.
 */
const BMP280Sensor = ({ scale = 1, onPinClick, env }) => {
  // Extract Pressure (hPa) - Default to Sea Level (1013 hPa)
  const pressure = env?.pressure ?? 1013;

  // Determine Status Color based on Pressure
  let statusColor = '#00e676'; // Green (Normal ~1013)
  if (pressure < 980) statusColor = '#00bcd4'; // Blue (Low Pressure / Storm / High Alt)
  if (pressure > 1030) statusColor = '#ff9800'; // Orange (High Pressure / Clear Sky)

  return (
    <svg 
      width={105} 
      height={110} 
      viewBox="0 0 105 110" 
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <filter id="purpleShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Title */}
      <text x="52.5" y="-10" textAnchor="middle" fill="#ffffff" fontFamily="Arial" fontSize="11" fontWeight="bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        BMP280
      </text>

      {/* --- PCB Body --- */}
      <g filter="url(#purpleShadow)">
        <rect x="5" y="5" width="95" height="90" rx="4" fill="#6a1b9a" stroke="#4a148c" strokeWidth="1" />
        
        {/* Mounting Holes */}
        <circle cx="15" cy="20" r="5" fill="#222" stroke="#d4af37" strokeWidth="2" />
        <circle cx="90" cy="20" r="5" fill="#222" stroke="#d4af37" strokeWidth="2" />

        {/* [SIMULATION VISUAL] Status LED */}
        {/* Visual feedback for Pressure changes */}
        <circle cx="52.5" cy="20" r="3" fill={statusColor} stroke="#fff" strokeWidth="1" />
        <circle cx="52.5" cy="20" r="6" fill={statusColor} opacity="0.4" />

        {/* Sensor Chip (Silver Metal Rectangle) */}
        <rect x="42.5" y="30" width="20" height="25" fill="#dcdcdc" stroke="#999" strokeWidth="1" />
        <circle cx="52.5" cy="42.5" r="1.5" fill="#333" /> {/* Vent hole */}

        {/* Traces / Decorative components */}
        <path d="M 15 85 L 15 70 M 30 85 L 30 70 M 45 85 L 45 70 M 60 85 L 60 70 M 75 85 L 75 70 M 90 85 L 90 70" stroke="#8e24aa" strokeWidth="2" />
      </g>

      {/* --- Interactive Terminals --- */}

      {/* 1. VCC */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('VCC'); }} style={{ cursor: 'pointer' }}>
        <circle cx="15" cy="100" r="3.5" fill="#ff0000" stroke="white" strokeWidth="1" />
        <line x1="15" y1="95" x2="15" y2="100" stroke="#ff0000" strokeWidth="2" />
        <text x="15" y="85" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 15,85)">VCC</text>
      </g>

      {/* 2. GND */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('GND'); }} style={{ cursor: 'pointer' }}>
        <circle cx="30" cy="100" r="3.5" fill="#000" stroke="white" strokeWidth="1" />
        <line x1="30" y1="95" x2="30" y2="100" stroke="#000" strokeWidth="2" />
        <text x="30" y="85" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 30,85)">GND</text>
      </g>

      {/* 3. SCL */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('SCL'); }} style={{ cursor: 'pointer' }}>
        <circle cx="45" cy="100" r="3.5" fill="#0000ff" stroke="white" strokeWidth="1" />
        <line x1="45" y1="95" x2="45" y2="100" stroke="#0000ff" strokeWidth="2" />
        <text x="45" y="85" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 45,85)">SCL</text>
      </g>

      {/* 4. SDA */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('SDA'); }} style={{ cursor: 'pointer' }}>
        <circle cx="60" cy="100" r="3.5" fill="#800080" stroke="white" strokeWidth="1" />
        <line x1="60" y1="95" x2="60" y2="100" stroke="#800080" strokeWidth="2" />
        <text x="60" y="85" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 60,85)">SDA</text>
      </g>

      {/* 5. CSB */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('CSB'); }} style={{ cursor: 'pointer' }}>
        <circle cx="75" cy="100" r="3.5" fill="#ff00ff" stroke="white" strokeWidth="1" />
        <line x1="75" y1="95" x2="75" y2="100" stroke="#ff00ff" strokeWidth="2" />
        <text x="75" y="85" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 75,85)">CSB</text>
      </g>

      {/* 6. SDO */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('SDO'); }} style={{ cursor: 'pointer' }}>
        <circle cx="90" cy="100" r="3.5" fill="#008000" stroke="white" strokeWidth="1" />
        <line x1="90" y1="95" x2="90" y2="100" stroke="#008000" strokeWidth="2" />
        <text x="90" y="85" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 90,85)">SDO</text>
      </g>

    </svg>
  );
};

export default BMP280Sensor;