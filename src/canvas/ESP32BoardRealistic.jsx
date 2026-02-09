import React, { useRef } from 'react';

/**
 * ESP32BoardRealistic.jsx (V27 - SYNTAX FIX)
 * - Layout: Standard 30-Pin DevKit V1
 * - Fix: Corrected JSX syntax for transform attribute on BOOT button.
 */

// --- 1. DIMENSIONS ---
const W = 470;   
const H = 750; 
const PIN_SPACING = 33; 
const PIN_START_Y = 170; 

// --- 2. PIN DEFINITIONS (Standard 30-Pin Layout) ---
const LEFT_PINS = [
  'EN', 'VP', 'VN', '34', '35', '32', '33', '25', 
  '26', '27', '14', '12', 'GND', '13', 'VIN'
];

const RIGHT_PINS = [
  '3V3', 'GND', '15', '2', '4', '16', '17', '5', 
  '18', '19', '21', 'RX', 'TX', '22', '23'
];

const COLORS = {
  pcb: '#1e1e1e',        
  shield: '#d1d5db',     
  pad: '#fbbf24',        
  padHole: '#1e1e1e',    
  text: '#ffffff',       
  active: '#4ade80',     
  blocked: '#ef4444',    
  usb: '#9ca3af',        
  button: '#e5e7eb'      
};

export default function ESP32BoardRealistic({ wireMode, activePins, pinStatus, onPinClick }) {
  const svgRef = useRef(null);

  const getScreenCoords = (internalX, internalY) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = internalX;
    pt.y = internalY;
    const screenPt = pt.matrixTransform(svgRef.current.getScreenCTM());
    return { x: screenPt.x, y: screenPt.y };
  };

  const handlePinClick = (e, label, internalX, internalY) => {
    const screenCoords = getScreenCoords(internalX, internalY);
    if (onPinClick) {
      onPinClick(e, label, {
        x: internalX,        
        y: internalY,        
        screenX: screenCoords.x, 
        screenY: screenCoords.y  
      });
    }
  };

  return (
    <svg 
      ref={svgRef}
      width={W} 
      height={H} 
      viewBox={`0 0 ${W} ${H}`} 
      style={{ overflow: 'visible', userSelect: 'none', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
    >
      <defs>
        <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>
      </defs>

      {/* --- 1. PCB BOARD BODY --- */}
      <rect x={15} y={40} width={W - 30} height={H - 50} rx={22} fill={COLORS.pcb} stroke="#000" strokeWidth={3} />

      {/* --- 2. ESPRESSIF MODULE --- */}
      <g transform={`translate(${(W - 270)/2}, 25)`}> 
         <rect x={0} y={0} width={270} height={40} rx={5} fill="#18181b" /> 
         <path d="M45,0 L225,0 L225,30 L45,30 Z" fill="#27272a" /> 
         <rect x={10} y={35} width={250} height={180} rx={4} fill="url(#metalGrad)" stroke="#6b7280" strokeWidth={1.5} />
         
         <g transform="translate(30, 30)">
            <circle cx={45} cy={70} r={10} fill="none" stroke="#4b5563" strokeWidth={2.5} />
            <path d="M39,70 L51,70 M45,64 L45,76" stroke="#4b5563" strokeWidth={2.5} />
            <text x={65} y={78} fontFamily="sans-serif" fontWeight="800" fontSize="20" fill="#374151" letterSpacing="1">ESPRESSIF</text>
            <text x={125} y={115} textAnchor="middle" fontFamily="monospace" fontWeight="600" fontSize="16" fill="#4b5563">ESP32-WROOM</text>
         </g>
         
         <g transform="translate(10, 220)">
            {[...Array(9)].map((_, i) => (
               <rect key={i} x={i * 28 + 10} y={-5} width={14} height={10} fill="#fbbf24" />
            ))}
         </g>
      </g>

      {/* --- 3. PINS --- */}
      {LEFT_PINS.map((label, i) => (
        <PinRow 
          key={`L-${label}-${i}`} i={i} side="left" label={label} 
          isActive={activePins?.has(label)} status={pinStatus?.get(label)}
          onSmartClick={handlePinClick} 
          wireMode={wireMode}
        />
      ))}

      {RIGHT_PINS.map((label, i) => (
        <PinRow 
          key={`R-${label}-${i}`} i={i} side="right" label={label} 
          isActive={activePins?.has(label)} status={pinStatus?.get(label)}
          onSmartClick={handlePinClick} 
          wireMode={wireMode}
        />
      ))}

      {/* --- 4. BOTTOM COMPONENTS --- */}
      <g transform={`translate(0, ${H - 80})`}>
        <rect x={W/2 - 45} y={15} width={90} height={50} rx={5} fill={COLORS.usb} stroke="#4b5563" strokeWidth={2} />
        <rect x={W/2 - 45} y={15} width={90} height={10} fill="#52525b" />
        
        <g transform="translate(65, 20)">
           <rect width={35} height={45} rx={4} fill={COLORS.button} stroke="#9ca3af" strokeWidth={2} />
           <circle cx={17.5} cy={22} r={9} fill="#18181b" />
           <text x={17.5} y={-6} textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="bold">EN</text>
        </g>
        
        {/* ✅ FIXED: Use backticks for calculation */}
        <g transform={`translate(${W - 100}, 20)`}>
           <rect width={35} height={45} rx={4} fill={COLORS.button} stroke="#9ca3af" strokeWidth={2} />
           <circle cx={17.5} cy={22} r={9} fill="#18181b" />
           <text x={17.5} y={-6} textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="bold">BOOT</text>
        </g>
        
        <rect x={W/2 - 25} y={-60} width={50} height={50} rx={3} fill="#18181b" stroke="#333" strokeWidth={2} />
      </g>
    </svg>
  );
}

// --- SUB-COMPONENT: Pin Row ---
function PinRow({ i, side, label, isActive, status, onSmartClick, wireMode }) {
  const isLeft = side === 'left';
  const y = PIN_START_Y + (i * PIN_SPACING);
  
  const padX = isLeft ? 45 : W - 45; 
  const textX = isLeft ? 80 : W - 80; 

  const color = status === 'BLOCKED' ? COLORS.blocked : COLORS.pad;

  return (
    <g 
      id={`pin-${label}`}
      onClick={(e) => onSmartClick(e, label, padX, y)} 
      style={{ cursor: wireMode ? 'crosshair' : 'pointer' }}
    >
      <rect x={isLeft ? 0 : W/2} y={y - 15} width={W/2} height={30} fill="transparent" />
      <circle cx={padX} cy={y} r={11} fill={color} stroke="#b45309" strokeWidth={1.5} />
      <circle cx={padX} cy={y} r={5.5} fill={COLORS.padHole} /> 
      {isActive && (
         <circle cx={padX} cy={y} r={17} fill="none" stroke={COLORS.active} strokeWidth={3} opacity={0.8} />
      )}
      <text 
        x={textX} y={y + 5} 
        textAnchor={isLeft ? 'start' : 'end'} 
        fill={isActive ? COLORS.active : COLORS.text} 
        fontFamily="monospace" fontSize="18" fontWeight="bold"  
        style={{ pointerEvents: 'none' }} 
      >
        {label}
      </text>
    </g>
  );
}