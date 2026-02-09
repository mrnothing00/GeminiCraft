import React from 'react';

// ==============================================================================
// PIN OFFSETS
// Left Side: Output Terminals (NO, COM, NC) - Connected at edge (x=0)
// Right Side: Control Pins (IN, GND, VCC) - Connected at edge (x=120)
// ==============================================================================
export const RELAY_PIN_OFFSETS = {
  // Left Side (High Voltage Terminals)
  NO:  { x: 0, y: 25 },
  COM: { x: 0, y: 45 },
  NC:  { x: 0, y: 65 },
  
  // Right Side (Control Pins)
  IN:  { x: 120, y: 35 },
  GND: { x: 120, y: 45 },
  VCC: { x: 120, y: 55 }
};

/**
 * 1-Channel Relay Module
 * UPGRADE: Status LED glows and visual "CLICK" indicator appears when active.
 */
const RelayModule = ({ onPinClick, isOn = false }) => {
  return (
    <div style={{ position: 'relative', width: 120, height: 90 }}>
      
      {/* Main SVG Body */}
      <svg width="120" height="90" viewBox="0 0 120 90" style={{ overflow: 'visible' }}>
        
        {/* ─── VISUAL PINS (LEFT SIDE) ──────────────────────────────────── */}
        <rect x="0" y="24" width="12" height="2" fill="#ccc" />
        <rect x="0" y="44" width="12" height="2" fill="#ccc" />
        <rect x="0" y="64" width="12" height="2" fill="#ccc" />

        {/* ─── PCB BOARD ────────────────────────────────────────────────── */}
        <rect x="10" y="10" width="100" height="70" rx="4" fill="#2c3e50" stroke="#222" strokeWidth="1" />
        
        {/* ─── BLUE RELAY CUBE ──────────────────────────────────────────── */}
        <rect x="35" y="15" width="50" height="60" rx="2" fill="#3498db" stroke="#2980b9" strokeWidth="2" />
        <text x="60" y="45" fill="#ecf0f1" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
          RELAY
        </text>
        <text x="60" y="55" fill="#ecf0f1" fontSize="8" textAnchor="middle" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
          5V
        </text>

        {/* ─── OUTPUT TERMINAL BLOCK (Left) ─────────────────────────────── */}
        <rect x="12" y="15" width="20" height="60" fill="#27ae60" stroke="#2ecc71" strokeWidth="1" />
        {/* Screws */}
        <circle cx="22" cy="25" r="4" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="1" />
        <circle cx="22" cy="45" r="4" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="1" />
        <circle cx="22" cy="65" r="4" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="1" />

        {/* ─── CONTROL HEADER (Right) ───────────────────────────────────── */}
        <rect x="90" y="30" width="15" height="30" fill="#333" />
        {/* Right Side Pins */}
        <rect x="105" y="34" width="15" height="2" fill="#ccc" />
        <rect x="105" y="44" width="15" height="2" fill="#ccc" />
        <rect x="105" y="54" width="15" height="2" fill="#ccc" />

        {/* ─── LED INDICATORS ───────────────────────────────────────────── */}
        
        {/* Power LED (Always Red) */}
        <circle cx="95" cy="20" r="3" fill="#e74c3c" />
        
        {/* [SIMULATION VISUAL] Status LED (Green) */}
        {/* Glows bright green when relay is ON */}
        <circle 
          cx="95" cy="70" r="3" 
          fill={isOn ? "#00ff00" : "#004400"} 
          stroke={isOn ? "#fff" : "none"} strokeWidth="1"
        />
        {isOn && <circle cx="95" cy="70" r="6" fill="#00ff00" opacity="0.4" />}

        {/* ─── CLICKABLE HOTSPOTS (Invisible) ───────────────────────────── */}
        
        {/* --- LEFT SIDE (NO, COM, NC) --- */}
        <circle cx="0" cy="25" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'NO'); }} />
        <circle cx="0" cy="45" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'COM'); }} />
        <circle cx="0" cy="65" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'NC'); }} />

        {/* --- RIGHT SIDE (IN, GND, VCC) --- */}
        <circle cx="120" cy="35" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'IN'); }} />
        <circle cx="120" cy="45" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }} />
        <circle cx="120" cy="55" r="6" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }} />

      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 18, left: -20, fontSize: 8, color: '#e056fd', fontWeight: 'bold' }}>NO</div>
      <div style={{ position: 'absolute', top: 38, left: -22, fontSize: 8, color: '#4834d4', fontWeight: 'bold' }}>COM</div>
      <div style={{ position: 'absolute', top: 58, left: -20, fontSize: 8, color: '#6ab04c', fontWeight: 'bold' }}>NC</div>

      <div style={{ position: 'absolute', top: 28, left: 122, fontSize: 8, color: '#be2edd', fontWeight: 'bold' }}>IN</div>
      <div style={{ position: 'absolute', top: 38, left: 122, fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>GND</div>
      <div style={{ position: 'absolute', top: 48, left: 122, fontSize: 8, color: '#e74c3c', fontWeight: 'bold' }}>VCC</div>
    </div>
  );
};

export default RelayModule;