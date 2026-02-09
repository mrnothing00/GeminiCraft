import React, { useEffect, useState } from 'react';

// ==============================================================================
// PIN OFFSETS
// Located at the bottom of the ring for easy wiring.
// Order based on image: GND (Left), VCC (Middle), DI (Right)
// ==============================================================================
export const NEOPIXEL_PIN_OFFSETS = {
  GND: { x: 35, y: 95 }, 
  VCC: { x: 50, y: 95 },
  DI:  { x: 65, y: 95 }  // Data In
};

/**
 * 12-Bit NeoPixel Ring
 * UPGRADE: Animations! Shows a spinning rainbow when 'isOn' is true.
 * Can also accept a 'colors' prop (array of hex) for specific control.
 */
const NeoPixelRing = ({ onPinClick, isOn = false, colors = [] }) => {
  const [tick, setTick] = useState(0);

  // Animation Loop for Rainbow Effect
  useEffect(() => {
    if (!isOn) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 50); // Speed of animation
    return () => clearInterval(interval);
  }, [isOn]);

  // Create an array for the 12 LEDs arranged in a circle
  const leds = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30) * (Math.PI / 180); // 30 degrees per LED
    const r = 35; // Radius of LED ring
    const x = 50 + r * Math.cos(angle); // Center is 50,50
    const y = 50 + r * Math.sin(angle);
    
    // Determine Color:
    // 1. If explicit 'colors' array passed, use it.
    // 2. If 'isOn' is true, generate Rainbow.
    // 3. Else, Grey (Off).
    let fill = '#444'; // Off state
    let glow = 'none';

    if (colors[i]) {
      fill = colors[i];
      glow = `drop-shadow(0 0 5px ${fill})`;
    } else if (isOn) {
      // Rainbow Math: Shift hue based on index (i) and time (tick)
      const hue = (i * 30 + tick * 10) % 360;
      fill = `hsl(${hue}, 100%, 50%)`;
      glow = `drop-shadow(0 0 8px ${fill})`;
    }

    return { x, y, id: i, fill, glow };
  });

  return (
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      
      {/* Main SVG Body */}
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        
        {/* ─── PCB RING ─────────────────────────────────────────────────── */}
        {/* Outer Black Circle */}
        <circle cx="50" cy="50" r="48" fill="#111" stroke="#333" strokeWidth="1" />
        {/* Inner Hole (Transparency simulated by background color or darker fill) */}
        <circle cx="50" cy="50" r="25" fill="#0f0f1a" stroke="#333" strokeWidth="1" />

        {/* ─── LEDS (5050 SMD Packages) ─────────────────────────────────── */}
        {leds.map((led) => (
          <g key={led.id} transform={`translate(${led.x}, ${led.y})`}>
            {/* White Casing */}
            <rect x="-6" y="-6" width="12" height="12" fill="#eee" rx="1" />
            
            {/* The LED Lens (The glowing part) */}
            <circle 
              cx="0" cy="0" r="4" 
              fill={led.fill} 
              style={{ filter: led.glow, transition: 'fill 0.1s' }}
            />
          </g>
        ))}

        {/* ─── LABELS ON PCB ────────────────────────────────────────────── */}
        <text x="50" y="52" fill="#aaa" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace" style={{ pointerEvents: 'none' }}>
          NEO
        </text>

        {/* ─── CONNECTION PADS ──────────────────────────────────────────── */}
        {/* Metal pads at the bottom */}
        <rect x="32" y="88" width="6" height="8" fill="#d4af37" rx="1" />
        <rect x="47" y="88" width="6" height="8" fill="#d4af37" rx="1" />
        <rect x="62" y="88" width="6" height="8" fill="#d4af37" rx="1" />

        {/* ─── CLICKABLE HOTSPOTS ───────────────────────────────────────── */}
        
        {/* GND */}
        <circle 
          cx="35" cy="95" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'GND'); }}
        />

        {/* VCC */}
        <circle 
          cx="50" cy="95" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'VCC'); }}
        />

        {/* DI (Data In) */}
        <circle 
          cx="65" cy="95" r="5" fill="transparent" stroke="none" cursor="crosshair"
          onClick={(e) => { e.stopPropagation(); onPinClick(e, 'DI'); }}
        />
      </svg>

      {/* ─── HOVER LABELS ───────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 98, left: 28, fontSize: 8, color: '#aaa', fontWeight: 'bold' }}>GND</div>
      <div style={{ position: 'absolute', top: 98, left: 45, fontSize: 8, color: '#e74c3c', fontWeight: 'bold' }}>5V</div>
      <div style={{ position: 'absolute', top: 98, left: 62, fontSize: 8, color: '#3498db', fontWeight: 'bold' }}>DI</div>
    </div>
  );
};

export default NeoPixelRing;