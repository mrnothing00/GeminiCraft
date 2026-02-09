import React, { useState } from 'react';

// ==============================================================================
// PIN OFFSETS
// Standard RGB LED 4-pin layout: Red, Common, Green, Blue
// ==============================================================================
export const RGB_LED_PIN_OFFSETS = {
  RED:   { x: 15, y: 70 },
  COM:   { x: 35, y: 70 }, // Common Pin (Longest)
  GREEN: { x: 55, y: 70 },
  BLUE:  { x: 75, y: 70 }
};

/**
 * 4-Pin RGB LED Component
 * UPGRADE: Visual glow when 'isOn'. Defaults to White for simplicity.
 */
const RGBLEDSensor = ({ onPinClick, isOn = false }) => {
  const [commonType, setCommonType] = useState('CATHODE'); // 'CATHODE' (-) or 'ANODE' (+)
  const [showMenu, setShowMenu] = useState(false);

  const handleTypeSelect = (type, e) => {
    e.stopPropagation();
    setCommonType(type);
    setShowMenu(false);
  };

  return (
    <div style={{ position: 'relative', width: 90, height: 70 }}>
      
      {/* ─── CONFIGURATION MENU ("Upstairs") ───────────────────────────── */}
      {showMenu && (
        <div style={{
          position: 'absolute',
          top: -45,
          left: -15,
          width: 120,
          background: '#222',
          border: '1px solid #444',
          borderRadius: 4,
          padding: 6,
          zIndex: 100,
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
          <div style={{ fontSize: 9, color: '#aaa', marginBottom: 2 }}>Common Type:</div>
          <button 
            onClick={(e) => handleTypeSelect('CATHODE', e)}
            style={{ 
              background: commonType === 'CATHODE' ? '#2ecc71' : '#333', 
              border: 'none', color: '#fff', fontSize: 9, padding: '2px 4px', borderRadius: 2, cursor: 'pointer' 
            }}
          >
            Cathode (-)
          </button>
          <button 
            onClick={(e) => handleTypeSelect('ANODE', e)}
            style={{ 
              background: commonType === 'ANODE' ? '#e74c3c' : '#333', 
              border: 'none', color: '#fff', fontSize: 9, padding: '2px 4px', borderRadius: 2, cursor: 'pointer' 
            }}
          >
            Anode (+)
          </button>
        </div>
      )}

      {/* Main SVG Body */}
      <svg width="90" height="70" viewBox="0 0 90 70" style={{ overflow: 'visible' }}>
        
        {/* ─── LEGS ─────────────────────────────────────────────────────── */}
        <line x1="15" y1="45" x2="15" y2="70" stroke="#ccc" strokeWidth="2" /> {/* Red */}
        <line x1="35" y1="45" x2="35" y2="75" stroke="#ccc" strokeWidth="2" /> {/* Common (Longer) */}
        <line x1="55" y1="45" x2="55" y2="70" stroke="#ccc" strokeWidth="2" /> {/* Green */}
        <line x1="75" y1="45" x2="75" y2="70" stroke="#ccc" strokeWidth="2" /> {/* Blue */}

        {/* ─── BULB BODY ────────────────────────────────────────────────── */}
        <g 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
          style={{ 
            cursor: 'pointer',
            // [SIMULATION VISUAL] CSS Drop-Shadow Glow (White)
            filter: isOn ? 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))' : 'none',
            transition: 'filter 0.2s ease-in-out'
          }}
        >
          
          {/* Main Dome (White/Clear for RGB) */}
          <path 
            d="M 25 35 L 25 15 A 20 20 0 0 1 65 15 L 65 35 Z" 
            fill={isOn ? "#fff" : "rgba(255, 255, 255, 0.5)"} 
            stroke="#ccc" 
            strokeWidth="1" 
          />
          
          {/* Internal Elements (RGB Chips) - Visible when OFF */}
          {!isOn && (
            <>
              <rect x="38" y="20" width="4" height="6" fill="#ff4d4d" opacity="0.8" />
              <rect x="43" y="20" width="4" height="6" fill="#2ecc71" opacity="0.8" />
              <rect x="48" y="20" width="4" height="6" fill="#2980b9" opacity="0.8" />
            </>
          )}

          {/* Base Rim */}
          <rect x="23" y="35" width="44" height="8" rx="2" fill="#eee" stroke="#999" strokeWidth="1" />
        </g>

        {/* ─── LABELS ───────────────────────────────────────────────────── */}
        <text x="15" y="65" fill="#ff4d4d" fontSize="8" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>R</text>
        
        {/* Dynamic Common Label */}
        <text x="35" y="65" fill={commonType === 'CATHODE' ? '#000' : '#e74c3c'} fontSize="10" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>
          {commonType === 'CATHODE' ? '-' : '+'}
        </text>
        
        <text x="55" y="65" fill="#2ecc71" fontSize="8" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>G</text>
        <text x="75" y="65" fill="#2980b9" fontSize="8" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>B</text>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        <circle cx="15" cy="70" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'RED'); }} />
        <circle cx="35" cy="70" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'COM'); }} />
        <circle cx="55" cy="70" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GREEN'); }} />
        <circle cx="75" cy="70" r="4" fill="transparent" stroke="none" cursor="crosshair" onClick={(e) => { e.stopPropagation(); onPinClick(e, 'BLUE'); }} />

      </svg>
    </div>
  );
};

export default RGBLEDSensor;