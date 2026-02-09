import React from 'react';

// ==========================================
// BME280 Metadata
// ==========================================
export const BME280_PIN_OFFSETS = {
  'VIN': { x: 20, y: 100 }, // Pin 1
  'GND': { x: 40, y: 100 }, // Pin 2
  'SCL': { x: 60, y: 100 }, // Pin 3
  'SDA': { x: 80, y: 100 }  // Pin 4
};

export const BME280_WIDTH = 100;
export const BME280_HEIGHT = 110;

/**
 * BME280 Temp/Humidity/Pressure Sensor
 * UPGRADE: Accepts 'env' prop to show visual temp indicator.
 */
const BME280Sensor = ({ scale = 1, onPinClick, env }) => {
  // Extract temp from simulation environment (default to 25°C)
  const temp = env?.temperature ?? 25;

  // Determine Status Color based on Temperature
  let statusColor = '#00e676'; // Green (Normal)
  if (temp < 10) statusColor = '#00bcd4'; // Blue (Cold)
  if (temp > 30) statusColor = '#ff5252'; // Red (Hot)

  return (
    <svg 
      width={100} 
      height={110} 
      viewBox="0 0 100 110" 
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <filter id="bmeShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Title */}
      <text x="50" y="-10" textAnchor="middle" fill="#ffffff" fontFamily="Arial" fontSize="11" fontWeight="bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        BME280
      </text>

      {/* --- PCB Body --- */}
      <g filter="url(#bmeShadow)">
        <rect x="5" y="5" width="90" height="90" rx="4" fill="#6a1b9a" stroke="#4a148c" strokeWidth="1" />
        
        {/* Mounting Hole (Top Left) */}
        <circle cx="20" cy="20" r="6" fill="#222" stroke="#d4af37" strokeWidth="2" />

        {/* [SIMULATION VISUAL] Status LED Indicator */}
        {/* Small SMD LED that changes color with temp */}
        <circle cx="80" cy="20" r="3" fill={statusColor} stroke="#fff" strokeWidth="1" />
        <circle cx="80" cy="20" r="6" fill={statusColor} opacity="0.3" /> {/* Glow */}

        {/* Sensor Chip (Silver Square Top Right) */}
        <rect x="55" y="40" width="25" height="25" fill="#dcdcdc" stroke="#999" strokeWidth="1" />
        <circle cx="67.5" cy="52.5" r="1.5" fill="#333" /> 

        {/* Decorative Traces */}
        <path d="M 45 40 L 45 55 M 55 40 L 55 55" stroke="#d4af37" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* --- Pin Labels (Vertical) --- */}
      <text x="20" y="85" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 20,85)">VIN</text>
      <text x="40" y="85" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 40,85)">GND</text>
      <text x="60" y="85" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 60,85)">SCL</text>
      <text x="80" y="85" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="monospace" transform="rotate(-90 80,85)">SDA</text>

      {/* --- Interactive Terminals --- */}

      {/* 1. VIN */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('VIN'); }} style={{ cursor: 'pointer' }}>
        <circle cx="20" cy="100" r="3.5" fill="#ff0000" stroke="white" strokeWidth="1" />
        <line x1="20" y1="95" x2="20" y2="100" stroke="#ff0000" strokeWidth="2" />
      </g>

      {/* 2. GND */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('GND'); }} style={{ cursor: 'pointer' }}>
        <circle cx="40" cy="100" r="3.5" fill="#000" stroke="white" strokeWidth="1" />
        <line x1="40" y1="95" x2="40" y2="100" stroke="#000" strokeWidth="2" />
      </g>

      {/* 3. SCL */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('SCL'); }} style={{ cursor: 'pointer' }}>
        <circle cx="60" cy="100" r="3.5" fill="#00bcd4" stroke="white" strokeWidth="1" />
        <line x1="60" y1="95" x2="60" y2="100" stroke="#00bcd4" strokeWidth="2" />
      </g>

      {/* 4. SDA */}
      <g onClick={(e) => { e.stopPropagation(); onPinClick('SDA'); }} style={{ cursor: 'pointer' }}>
        <circle cx="80" cy="100" r="3.5" fill="#00bcd4" stroke="white" strokeWidth="1" />
        <line x1="80" y1="95" x2="80" y2="100" stroke="#00bcd4" strokeWidth="2" />
      </g>

    </svg>
  );
};

export default BME280Sensor;