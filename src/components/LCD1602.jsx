import React from 'react';

// ==========================================
// LCD 16x2 Metadata
// ==========================================
export const LCD1602_PIN_OFFSETS = {
  'VSS': { x: 10, y: 75 }, // 1. GND
  'VCC': { x: 20, y: 75 }, // 2. 5V
  'V0':  { x: 30, y: 75 }, // 3. Contrast
  'RS':  { x: 40, y: 75 }, // 4. Register Select
  'RW':  { x: 50, y: 75 }, // 5. Read/Write
  'E':   { x: 60, y: 75 }, // 6. Enable
  'D0':  { x: 70, y: 75 }, // 7. Data 0
  'D1':  { x: 80, y: 75 }, // 8. Data 1
  'D2':  { x: 90, y: 75 }, // 9. Data 2
  'D3':  { x: 100, y: 75 },// 10. Data 3
  'D4':  { x: 110, y: 75 },// 11. Data 4
  'D5':  { x: 120, y: 75 },// 12. Data 5
  'D6':  { x: 130, y: 75 },// 13. Data 6
  'D7':  { x: 140, y: 75 },// 14. Data 7
  'A':   { x: 150, y: 75 },// 15. Backlight +
  'K':   { x: 160, y: 75 } // 16. Backlight -
};

export const LCD1602_WIDTH = 170;
export const LCD1602_HEIGHT = 80;

/**
 * LCD 16x2 Display Component
 * UPGRADE: Accepts 'text' prop (Array of 2 strings) to display dynamic content.
 */
const LCD1602 = ({ scale = 1, onPinClick, text = ["", ""] }) => {
  
  // Safe fallback if text is undefined
  const line1 = text && text[0] ? text[0] : "";
  const line2 = text && text[1] ? text[1] : "";
  const hasPower = line1 || line2; // Simple logic: if text exists, assume it's powered

  return (
    <div style={{ position: 'relative', width: 170, height: 80 }}>
      <svg 
        width={170} 
        height={80} 
        viewBox="0 0 170 80" 
        style={{ overflow: 'visible', userSelect: 'none' }}
      >
        <defs>
          <filter id="lcdShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
          </filter>
          
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            {/* Brighter green if 'powered', darker if off/empty */}
            <stop offset="0%" stopColor={hasPower ? "#9acd32" : "#556b2f"} />
            <stop offset="100%" stopColor={hasPower ? "#8db600" : "#4a5d23"} />
          </linearGradient>

          {/* [FIX] Added missing pixel grid pattern definition */}
          <pattern id="pixelPattern" width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" fill="#000" opacity="0.1" />
          </pattern>
        </defs>

        {/* --- PCB Body (Green) --- */}
        <g filter="url(#lcdShadow)">
          <rect x="0" y="0" width="170" height="70" rx="3" fill="#006400" stroke="#004d00" strokeWidth="1" />
          
          {/* Mounting Holes */}
          <circle cx="5" cy="5" r="2.5" fill="#222" stroke="#d4af37" strokeWidth="1" />
          <circle cx="165" cy="5" r="2.5" fill="#222" stroke="#d4af37" strokeWidth="1" />
          <circle cx="5" cy="65" r="2.5" fill="#222" stroke="#d4af37" strokeWidth="1" />
          <circle cx="165" cy="65" r="2.5" fill="#222" stroke="#d4af37" strokeWidth="1" />

          {/* Screen Bezel (Black) */}
          <rect x="15" y="10" width="140" height="40" rx="2" fill="#222" stroke="#444" strokeWidth="1" />
          
          {/* Active Screen Area (Lime Green) */}
          <rect x="20" y="13" width="130" height="34" fill="url(#screenGrad)" />
          
          {/* Screen Matrix Grid Effect (Subtle overlay) */}
          <rect x="20" y="13" width="130" height="34" fill="url(#pixelPattern)" opacity="0.3" />
          
          {/* --- DYNAMIC TEXT RENDERING --- */}
          {/* This replaces the old static label */}
          <g style={{ fontFamily: "'Courier New', monospace", fontSize: '12px', fill: '#222', fontWeight: 'bold' }}>
            {/* Line 1 */}
            <text x="25" y="27">{line1}</text>
            {/* Line 2 */}
            <text x="25" y="42">{line2}</text>
          </g>
        </g>

        {/* --- Pin Labels (Tiny) --- */}
        {/* Group 1: Power & Control */}
        <text x="10" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">VSS</text>
        <text x="20" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">VCC</text>
        <text x="30" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">V0</text>
        <text x="40" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">RS</text>
        <text x="50" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">RW</text>
        <text x="60" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">E</text>
        
        {/* Group 2: Data */}
        <text x="70" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">D0</text>
        <text x="140" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">D7</text>
        
        {/* Group 3: Backlight */}
        <text x="150" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">A</text>
        <text x="160" y="60" textAnchor="middle" fill="#fff" fontSize="5" fontFamily="monospace">K</text>

        {/* --- Interactive Terminals (1-16) --- */}
        {[
          { id: 'VSS', x: 10, color: '#000' },
          { id: 'VCC', x: 20, color: '#ff0000' },
          { id: 'V0',  x: 30, color: '#e67e22' },
          { id: 'RS',  x: 40, color: '#00bcd4' },
          { id: 'RW',  x: 50, color: '#00bcd4' },
          { id: 'E',   x: 60, color: '#9c27b0' },
          { id: 'D0',  x: 70, color: '#4caf50' },
          { id: 'D1',  x: 80, color: '#4caf50' },
          { id: 'D2',  x: 90, color: '#4caf50' },
          { id: 'D3',  x: 100, color: '#4caf50' },
          { id: 'D4',  x: 110, color: '#4caf50' },
          { id: 'D5',  x: 120, color: '#4caf50' },
          { id: 'D6',  x: 130, color: '#4caf50' },
          { id: 'D7',  x: 140, color: '#4caf50' },
          { id: 'A',   x: 150, color: '#ff0000' },
          { id: 'K',   x: 160, color: '#000' },
        ].map((pin) => (
          <g key={pin.id} onClick={(e) => { e.stopPropagation(); onPinClick(pin.id); }} style={{ cursor: 'pointer' }}>
            <rect x={pin.x - 2} y={65} width={4} height={5} fill="#ccc" />
            <circle cx={pin.x} cy={75} r="3" fill={pin.color} stroke="white" strokeWidth="1" />
          </g>
        ))}

      </svg>
    </div>
  );
};

export default LCD1602;