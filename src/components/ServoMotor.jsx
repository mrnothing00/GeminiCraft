import React from 'react';

// ==============================================================================
// PIN OFFSETS (WIRES EXTENDED)
// ==============================================================================
export const SERVO_PIN_OFFSETS = {
  PWM: { x: 140, y: 60 }, // Orange Wire (Signal)
  VCC: { x: 140, y: 75 }, // Red Wire (Power)
  GND: { x: 140, y: 90 }  // Brown Wire (Ground)
};

/**
 * SG90 Servo Motor Component
 * UPGRADE: Smooth rotation animation for the servo horn (0-180 degrees).
 */
const ServoMotor = ({ onPinClick, angle = 0 }) => {
  // Clamp angle to realistic servo limits (0-180)
  const safeAngle = Math.max(0, Math.min(180, angle));

  return (
    // Increased width to 150 to fit the longer wires
    <div style={{ position: 'relative', width: 150, height: 110 }}>
      
      {/* Main SVG Body */}
      <svg width="150" height="110" viewBox="0 0 150 110" style={{ overflow: 'visible' }}>
        
        {/* ─── WIRES (Extended Length) ──────────────────────────────────── */}
        {/* Signal (Orange) */}
        <path d="M 85 60 L 140 60" stroke="#e67e22" strokeWidth="4" fill="none" />
        {/* VCC (Red) */}
        <path d="M 85 75 L 140 75" stroke="#e74c3c" strokeWidth="4" fill="none" />
        {/* GND (Brown) */}
        <path d="M 85 90 L 140 90" stroke="#5d4037" strokeWidth="4" fill="none" />

        {/* ─── WIRE CONNECTORS (Black plastic tips) ──────── */}
        <rect x="136" y="58" width="6" height="4" fill="#333" />
        <rect x="136" y="73" width="6" height="4" fill="#333" />
        <rect x="136" y="88" width="6" height="4" fill="#333" />

        {/* ─── BODY (Blue SG90) ─────────────────────────────────────────── */}
        {/* Mounting Tabs */}
        <rect x="5" y="45" width="100" height="15" fill="#2980b9" stroke="#1f618d" strokeWidth="1" />
        
        {/* Main Case */}
        <rect x="20" y="35" width="70" height="70" rx="4" fill="#3498db" stroke="#2980b9" strokeWidth="2" />
        
        {/* Label Area */}
        <rect x="28" y="60" width="54" height="35" fill="#2c3e50" rx="2" />
        <text x="55" y="82" fill="#ecf0f1" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
          SERVO
        </text>

        {/* ─── GEAR BOX TOP ─────────────────────────────────────────────── */}
        <rect x="35" y="20" width="25" height="15" fill="#3498db" stroke="#2980b9" strokeWidth="1" />

        {/* ─── ROTATING HORN (The Moving Part) ──────────────────────────── */}
        {/* We group everything to rotate around the screw center (47.5, 20) */}
        <g 
          style={{ 
            transformBox: 'fill-box',
            transformOrigin: '47.5px 20px', // Exact center of rotation
            // Rotate -90 so 0 degrees is "Left", 90 is "Up/Center", 180 is "Right"
            // Adjust this offset based on your simulation logic preference
            transform: `rotate(${safeAngle - 90}deg)`, 
            transition: 'transform 0.3s ease-out' 
          }}
        >
          {/* Main Circle Base */}
          <circle cx="47.5" cy="20" r="14" fill="#ecf0f1" stroke="#bdc3c7" strokeWidth="1" />
          
          {/* Arm Extension (The long part of the horn) */}
          {/* Extended length to make movement more visible */}
          <path d="M 43.5 20 L 43.5 50 A 4 4 0 0 0 51.5 50 L 51.5 20 Z" fill="#ecf0f1" stroke="#bdc3c7" strokeWidth="1" />
          
          {/* Screw Hole (Center) */}
          <circle cx="47.5" cy="20" r="3" fill="#95a5a6" stroke="#7f8c8d" strokeWidth="1" />
          <path d="M 46 18.5 L 49 21.5 M 49 18.5 L 46 21.5" stroke="#333" strokeWidth="1" /> {/* Screw head cross */}
          
          {/* Decoration Holes on Arm */}
          <circle cx="47.5" cy="35" r="1.5" fill="#bdc3c7" />
          <circle cx="47.5" cy="45" r="1.5" fill="#bdc3c7" />
        </g>

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* PWM (Signal) */}
        <circle 
          cx="140" cy="60" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'PWM'); }}
        />

        {/* VCC */}
        <circle 
          cx="140" cy="75" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }}
        />

        {/* GND */}
        <circle 
          cx="140" cy="90" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }}
        />
      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 55, left: 145, fontSize: 9, color: '#e67e22', fontWeight: 'bold' }}>PWM</div>
      <div style={{ position: 'absolute', top: 70, left: 145, fontSize: 9, color: '#e74c3c', fontWeight: 'bold' }}>VCC</div>
      <div style={{ position: 'absolute', top: 85, left: 145, fontSize: 9, color: '#8d6e63', fontWeight: 'bold' }}>GND</div>
    </div>
  );
};

export default ServoMotor;