import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { SketchRecognizer } from '../ai/SketchRecognizer.js';
import { WireRouter }       from './WireRouter.js';
import { PinDoctor, STATUS } from '../validation/PinDoctor.js';
import ESP32BoardRealistic  from '../canvas/ESP32BoardRealistic.jsx';

// ==========================================
// 1. HARDWARE COMPONENT IMPORTS
// ==========================================

import LiIonBattery, { LI_ION_PIN_OFFSETS } from '../components/LiIonBattery.jsx';
import DCPowerSupply, { DC_SUPPLY_PIN_OFFSETS } from '../components/DCPowerSupply.jsx';
import Keypad, { KEYPAD_PIN_OFFSETS } from '../components/Keypad.jsx';
import SwitchComponent, { SWITCH_PIN_OFFSETS } from '../components/SwitchComponent.jsx';
import PushButton, { PUSHBUTTON_PIN_OFFSETS } from '../components/PushButton.jsx';
import SevenSegment, { SEVEN_SEG_PIN_OFFSETS } from '../components/SevenSegment.jsx';
import OLEDDisplay, { OLED_PIN_OFFSETS } from '../components/OLEDDisplay.jsx';
import RGBLEDSensor, { RGB_LED_PIN_OFFSETS } from '../components/RGBLEDSensor.jsx';
import NeoPixelRing, { NEOPIXEL_PIN_OFFSETS } from '../components/NeoPixelRing.jsx';
import LEDSensor, { LED_PIN_OFFSETS } from '../components/LEDSensor.jsx';
import RelayModule, { RELAY_PIN_OFFSETS } from '../components/RelayModule.jsx';
import ServoMotor, { SERVO_PIN_OFFSETS } from '../components/ServoMotor.jsx';
import NTCSensor, { NTC_PIN_OFFSETS } from '../components/NTCSensor.jsx';
import PotentiometerSensor, { POTENTIOMETER_PIN_OFFSETS } from '../components/PotentiometerSensor.jsx';
import DHT11Sensor, { DHT11_PIN_OFFSETS } from '../components/DHT11Sensor.jsx'; 
import DHT22Sensor, { DHT22_PIN_OFFSETS } from '../components/DHT22Sensor.jsx';
import BMP280Sensor, { BMP280_PIN_OFFSETS } from '../components/BMP280Sensor.jsx';
import BME280Sensor, { BME280_PIN_OFFSETS } from '../components/BME280Sensor.jsx';
import LDRSensor, { LDR_PIN_OFFSETS } from '../components/LDRSensor.jsx';
import BH1750Sensor, { BH1750_PIN_OFFSETS } from '../components/BH1750Sensor.jsx';
import DCMotor, { DC_MOTOR_PIN_OFFSETS } from '../components/DCMotor.jsx';
import LCD1602, { LCD1602_PIN_OFFSETS } from '../components/LCD1602.jsx';
import DS18B20Sensor, { DS18B20_PIN_OFFSETS } from '../components/DS18B20Sensor.jsx'; 

// --- ALIASES (Mapping for Compatibility) ---
import { DHT11_PIN_OFFSETS as LM35_PIN_OFFSETS } from '../components/DHT11Sensor.jsx';
import { DHT11_PIN_OFFSETS as TMP36_PIN_OFFSETS } from '../components/DHT11Sensor.jsx';
import { DHT11_PIN_OFFSETS as HCSR501_PIN_OFFSETS } from '../components/DHT11Sensor.jsx'; 
import { DHT11_PIN_OFFSETS as PIR_PIN_OFFSETS } from '../components/DHT11Sensor.jsx';
import { DHT22_PIN_OFFSETS as AM2302_PIN_OFFSETS } from '../components/DHT22Sensor.jsx';
import { DHT22_PIN_OFFSETS as SHT30_PIN_OFFSETS } from '../components/DHT22Sensor.jsx';
import { DHT22_PIN_OFFSETS as HCSR04_PIN_OFFSETS } from '../components/DHT22Sensor.jsx'; 
import { DHT22_PIN_OFFSETS as TCS3200_PIN_OFFSETS } from '../components/DHT22Sensor.jsx'; 
import { DHT22_PIN_OFFSETS as MQ_PIN_OFFSETS } from '../components/DHT22Sensor.jsx'; 
import { DHT22_PIN_OFFSETS as MHZ19_PIN_OFFSETS } from '../components/DHT22Sensor.jsx';
import { DHT22_PIN_OFFSETS as MICS5524_PIN_OFFSETS } from '../components/DHT22Sensor.jsx';
import { BMP280_PIN_OFFSETS as BMP180_PIN_OFFSETS } from '../components/BMP280Sensor.jsx';
import { BMP280_PIN_OFFSETS as VL53L0X_PIN_OFFSETS } from '../components/BMP280Sensor.jsx';
import { BMP280_PIN_OFFSETS as CCS811_PIN_OFFSETS } from '../components/BMP280Sensor.jsx';
import { LED_PIN_OFFSETS as BUZZER_PIN_OFFSETS } from '../components/LEDSensor.jsx';
import { LED_PIN_OFFSETS as SPEAKER_PIN_OFFSETS } from '../components/LEDSensor.jsx';

// Component Aliases
const LM35Sensor = DHT11Sensor;
const TMP36Sensor = DHT11Sensor;
const HCSR501Sensor = DHT11Sensor;
const PIRSensor = DHT11Sensor;
const AM2302Sensor = DHT22Sensor;
const SHT30Sensor = DHT22Sensor;
const HCSR04Sensor = DHT22Sensor;
const TCS3200Sensor = DHT22Sensor;
const MQGasSensor = DHT22Sensor;
const MHZ19Sensor = DHT22Sensor;
const MiCS5524Sensor = DHT22Sensor;
const BMP180Sensor = BMP280Sensor;
const VL53L0XSensor = BMP280Sensor;
const CCS811Sensor = BMP280Sensor;
const ActiveBuzzer = LEDSensor;
const Speaker = LEDSensor;

const CANVAS_WIDTH  = 1200;
const CANVAS_HEIGHT = 800;
const GRID_SIZE     = 20;
const BOARD_SCALE   = 0.6;
const SENSOR_SCALE  = 1.1; 

const CATEGORIZED_PALETTE = {
  MICROCONTROLLERS: { label: "The Brain", color: "#3a86ff", items: [{ type: 'ESP32', label: 'ESP32 DevKit V1', icon: '🧠' }] },
  SENSORS_ENV: { label: "Environmental Sensors", color: "#00b894", items: [ { type: 'NTC', label: 'NTC Thermistor', icon: '🌡️' }, { type: 'POTENTIOMETER', label: 'Potentiometer (Rotary)', icon: '🎛️' }, { type: 'DS18B20', label: 'DS18B20 Waterproof', icon: '🌡️' }, { type: 'DHT22', label: 'DHT22 Temp/Humid', icon: '🌡️' }, { type: 'DHT11', label: 'DHT11 Temp/Humid', icon: '🌡️' }, { type: 'BME280', label: 'BME280 Pressure/Humid', icon: '☁️' }, { type: 'BMP280', label: 'BMP280 Pressure', icon: '☁️' }, { type: 'LDR', label: 'LDR Photoresistor', icon: '☀️' }, { type: 'BH1750', label: 'BH1750 Lux Sensor', icon: '💡' }, ] },
  ACTUATORS: { label: "Actuators (Outputs)", color: "#ff7675", items: [ { type: 'RGB_LED', label: 'RGB LED (4-Pin)', icon: '🎨' }, { type: 'NEOPIXEL', label: 'NeoPixel Ring', icon: '🌈' }, { type: 'LED', label: 'Smart LED', icon: '💡' }, { type: 'RELAY', label: 'Relay Module (1-CH)', icon: '🔌' }, { type: 'SERVO', label: 'Servo Motor (SG90)', icon: '🦾' }, { type: 'DC_MOTOR', label: 'DC Motor (Fan)', icon: '💨' } ] },
  DISPLAYS: { label: "Displays & Indicators", color: "#6c5ce7", items: [ { type: 'SEVEN_SEG', label: '7-Segment (8-Digit)', icon: '8️⃣' }, { type: 'OLED', label: 'OLED 0.96" (SPI)', icon: '📟' }, { type: 'LCD', label: 'LCD 16x2 (I2C)', icon: '📺' }, ] },
  INPUTS: { label: "User Input", color: "#fab1a0", items: [ { type: 'KEYPAD', label: 'Keypad 4x4', icon: '⌨️' }, { type: 'SWITCH', label: 'Rocker Switch', icon: '🔛' }, { type: 'BUTTON', label: 'Push Button', icon: '🔘' }, ] },
  POWER: { label: "Power Supply", color: "#ffeaa7", items: [ { type: 'LI_ION', label: 'Li-Ion 18650 Battery', icon: '🔋' }, { type: 'DC_SUPPLY', label: 'DC Power Supply', icon: '⚡' }, ] }
};

const WIRE_COLORS = { [STATUS.VALID]: '#00e676', [STATUS.WARNING]: '#ffab40', [STATUS.BLOCKED]: '#ff5252' };

function snapToGrid(val) { return Math.round(val / GRID_SIZE) * GRID_SIZE; }

// ==========================================
// 2. PIN LOOKUP TABLE
// ==========================================
const COMPONENT_PIN_MAP = {
  'DC_SUPPLY': DC_SUPPLY_PIN_OFFSETS, 'LI_ION': LI_ION_PIN_OFFSETS, 'KEYPAD': KEYPAD_PIN_OFFSETS, 'SWITCH': SWITCH_PIN_OFFSETS, 'BUTTON': PUSHBUTTON_PIN_OFFSETS, 'SEVEN_SEG': SEVEN_SEG_PIN_OFFSETS, 'OLED': OLED_PIN_OFFSETS, 'RGB_LED': RGB_LED_PIN_OFFSETS, 'NEOPIXEL': NEOPIXEL_PIN_OFFSETS, 'LED': LED_PIN_OFFSETS, 'RELAY': RELAY_PIN_OFFSETS, 'SERVO': SERVO_PIN_OFFSETS, 'NTC': NTC_PIN_OFFSETS, 'POTENTIOMETER': POTENTIOMETER_PIN_OFFSETS, 'DS18B20': DS18B20_PIN_OFFSETS, 'DHT11': DHT11_PIN_OFFSETS, 'DHT22': DHT22_PIN_OFFSETS, 'AM2302': AM2302_PIN_OFFSETS, 'LM35': LM35_PIN_OFFSETS, 'TMP36': TMP36_PIN_OFFSETS, 'SHT30': SHT30_PIN_OFFSETS, 'BMP180': BMP180_PIN_OFFSETS, 'BMP280': BMP280_PIN_OFFSETS, 'BME280': BME280_PIN_OFFSETS, 'HC-SR501': HCSR501_PIN_OFFSETS, 'PIR': PIR_PIN_OFFSETS, 'LDR': LDR_PIN_OFFSETS, 'BH1750': BH1750_PIN_OFFSETS, 'TCS3200': TCS3200_PIN_OFFSETS, 'HC-SR04': HCSR04_PIN_OFFSETS, 'VL53L0X': VL53L0X_PIN_OFFSETS, 'CCS811': CCS811_PIN_OFFSETS, 'MQ_GAS': MQ_PIN_OFFSETS, 'MH_Z19': MHZ19_PIN_OFFSETS, 'MiCS-5524': MICS5524_PIN_OFFSETS, 'DC_MOTOR': DC_MOTOR_PIN_OFFSETS, 'BUZZER': BUZZER_PIN_OFFSETS, 'LCD': LCD1602_PIN_OFFSETS, 'SPEAKER': SPEAKER_PIN_OFFSETS
};

function getGlobalPinCoordinates(pinName, component) {
  if (component.type === 'ESP32') return getESP32PinCoordinates(pinName, component.position);
  if (['LED_RED', 'LED_BLUE', 'LED_GREEN', 'LED_YELLOW'].includes(component.type)) return getLEDPinCoordinates(pinName, component.position);
  
  const offsets = COMPONENT_PIN_MAP[component.type];
  if (offsets && offsets[pinName]) {
    return {
      x: component.position.x + (offsets[pinName].x * SENSOR_SCALE),
      y: component.position.y + (offsets[pinName].y * SENSOR_SCALE)
    };
  }
  return { x: component.position.x + 60, y: component.position.y + 25 };
}

// ✅ FIX: Coordinates must exactly match the new ESP32BoardRealistic.jsx visual
function getESP32PinCoordinates(pinName, boardPosition) {
  // Pin Mapping (Standard 30-Pin DevKit V1)
  const LEFT_PINS = ['EN', 'VP', 'VN', '34', '35', '32', '33', '25', '26', '27', '14', '12', 'GND', '13', 'VIN'];
  const RIGHT_PINS = ['3V3', 'GND', '15', '2', '4', '16', '17', '5', '18', '19', '21', 'RX', 'TX', '22', '23'];

  const leftIndex = LEFT_PINS.indexOf(pinName);
  const rightIndex = RIGHT_PINS.indexOf(pinName);

  // --- DIMENSIONS (Must match ESP32BoardRealistic.jsx) ---
  const REAL_START_Y = 170; 
  const REAL_PIN_SPACING = 33; 
  
  // ✅ FIX: These X offsets were wrong. Now matched to visual board (45 and W-45).
  const REAL_LEFT_X = 45;  
  const REAL_RIGHT_X = 425; // 470 (Width) - 45

  if (leftIndex !== -1) {
    return { 
      x: boardPosition.x + (REAL_LEFT_X * BOARD_SCALE), 
      y: boardPosition.y + ((REAL_START_Y + (leftIndex * REAL_PIN_SPACING)) * BOARD_SCALE) 
    };
  }
  if (rightIndex !== -1) {
    return { 
      x: boardPosition.x + (REAL_RIGHT_X * BOARD_SCALE), 
      y: boardPosition.y + ((REAL_START_Y + (rightIndex * REAL_PIN_SPACING)) * BOARD_SCALE) 
    };
  }
  
  // Fallback for center
  return { x: boardPosition.x + 235 * BOARD_SCALE, y: boardPosition.y + 200 * BOARD_SCALE }; 
}

function getLEDPinCoordinates(pinName, pos) { 
  const offset = LED_PIN_OFFSETS[pinName]; 
  return offset ? { x: pos.x + (offset.x * SENSOR_SCALE), y: pos.y + (offset.y * SENSOR_SCALE) } : pos; 
}

function computeWirePath(startPos, endPos) {
  const midX = (startPos.x + endPos.x) / 2;
  return [
    startPos,
    { x: midX, y: startPos.y },
    { x: midX, y: endPos.y },
    endPos
  ];
}

// ===========================================================================
// 4. DrawingCanvas Component WITH ANIMATION
// ===========================================================================
export default function DrawingCanvas({ orchestrator, onCircuitChange, isSimulating }) {
  const [components, setComponents] = useState([
    { id: 'master_esp32', type: 'ESP32', label: 'Master ESP32', position: { x: 400, y: 100 }, color: '#3a86ff', icon: '🔲' }
  ]);
  const [wires, setWires] = useState([]); 
  const [sketchMode, setSketchMode] = useState(false);
  const [sketchPath, setSketchPath] = useState([]);   
  const [sketchLabel, setSketchLabel] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [wireMode, setWireMode] = useState(false);
  const [wireStart, setWireStart] = useState(null); 
  const [dragging, setDragging] = useState(null); 
  const [validationModal, setValidationModal] = useState(null); 
  
  // --- SIMULATION STATE ---
  const [simState, setSimState] = useState({ 
    pins: new Array(40).fill(0),
    env: { temperature: 25, lux: 500, humidity: 50 } 
  });
  const [potValues, setPotValues] = useState({});
  const [showSimControls, setShowSimControls] = useState(true);

  // ✨ ANIMATION STATE (Wokwi-style)
  const [animationFrame, setAnimationFrame] = useState(0);

  const [selectedItem, setSelectedItem] = useState(null); 
  const [movingComp, setMovingComp] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingVertex, setDraggingVertex] = useState(null); 
  const [selectedSketchIndex, setSelectedSketchIndex] = useState(null);
  const [movingSketchIndex, setMovingSketchIndex] = useState(null);
  const [sketchDragStart, setSketchDragStart] = useState(null);

  const canvasRef = useRef(null);
  const routerRef = useRef(null); 
  const doctorRef = useRef(null); 
  const recognizerRef = useRef(null); 

  const componentsRef = useRef(components);
  useEffect(() => { componentsRef.current = components; }, [components]);

  useEffect(() => {
    if (!doctorRef.current) {
      console.log('🔧 Initializing PinDoctor...');
      doctorRef.current = new PinDoctor();
      routerRef.current = new WireRouter(doctorRef.current);
      console.log('✅ PinDoctor ready');
    }
  }, []);

  useEffect(() => {
    window.__setSimState = (newState) => {
      if (!newState) return;
      setSimState(prev => ({
        pins: Array.isArray(newState.pins) ? [...newState.pins] : prev.pins,
        env: newState.env ? { ...prev.env, ...newState.env } : prev.env
      }));
    };
    return () => { window.__setSimState = null; };
  }, []);

  // ✨ ANIMATION LOOP (runs at ~30fps during simulation)
  useEffect(() => {
    if (!isSimulating) return;
    
    const animInterval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 33); // ~30fps
    
    return () => clearInterval(animInterval);
  }, [isSimulating]);

  // =========================================================================
  // AI COMMAND HANDLERS
  // =========================================================================
  useEffect(() => {
    const handleAIAdd = (e) => {
      const { type } = e.detail;
      console.log("🎨 AI Command: Adding", type);

      let paletteItem = null;
      Object.values(CATEGORIZED_PALETTE).forEach(cat => {
        const found = cat.items.find(i => i.type === type);
        if (found) paletteItem = { ...found, color: cat.color };
      });

      if (!paletteItem) {
        console.warn(`Type ${type} not in palette, using default.`);
        paletteItem = { label: type, color: '#ffffff', icon: '📦' };
      }

      const newComp = {
        id: `${type.toLowerCase()}_${Date.now()}_ai`,
        type: type,
        label: paletteItem.label,
        position: {
          x: 400 + (Math.random() * 60 - 30),
          y: 300 + (Math.random() * 60 - 30)
        },
        connectedPin: null,
        color: paletteItem.color,
        icon: paletteItem.icon
      };

      setComponents(prev => [...prev, newComp]);
    };

    const handleAIWire = (e) => {
      const connections = e.detail;
      console.log("🎨 AI Command: Wiring", connections);

      setWires(prevWires => {
        const currentComponents = componentsRef.current;
        const newWires = [];
        
        connections.forEach(conn => {
          const sourceComp = currentComponents.find(c => c.id === conn.fromComponent);
          const targetComp = currentComponents.find(c => c.id === conn.toComponent);

          if (sourceComp && targetComp) {
            const startPos = getGlobalPinCoordinates(conn.fromPin, sourceComp);
            const endPos = getGlobalPinCoordinates(conn.toPin, targetComp);

            newWires.push({
              id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              from: { component: conn.fromComponent, pin: conn.fromPin },
              to:   { component: conn.toComponent, pin: conn.toPin },
              status: 'VALID',
              path: computeWirePath(startPos, endPos)
            });
          }
        });
        return [...prevWires, ...newWires];
      });
    };

    document.addEventListener('circuit:add', handleAIAdd);
    document.addEventListener('circuit:autowire', handleAIWire);

    return () => {
      document.removeEventListener('circuit:add', handleAIAdd);
      document.removeEventListener('circuit:autowire', handleAIWire);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedSketchIndex !== null) {
          setSketchPath(prev => prev.filter((_, i) => i !== selectedSketchIndex));
          setSelectedSketchIndex(null);
          return;
        }
        if (selectedItem) {
          if (selectedItem.type === 'comp') {
            setComponents(prev => prev.filter(c => c.id !== selectedItem.id));
            setWires(prev => prev.filter(w => w.from.component !== selectedItem.id && w.to.component !== selectedItem.id));
          } else if (selectedItem.type === 'wire') {
            setWires(prev => prev.filter(w => w.id !== selectedItem.id));
          }
          setSelectedItem(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, selectedSketchIndex]);

  useEffect(() => {
    if (onCircuitChange) {
      onCircuitChange({
        components,
        connections: wires.map(w => ({ from: w.from, to: w.to, validated: w.status === STATUS.VALID })),
        wires: wires 
      });
    }
  }, [components, wires, onCircuitChange]);

  // =========================================================================
  // ✅ FIXED AI COMMAND HANDLERS (Robust & Smart)
  // =========================================================================
  useEffect(() => {
    // 1. Handle "Add Component" (Robust Type Matching)
    const handleAIAdd = (e) => {
      const rawType = e.detail.type || "";
      console.log("🎨 AI Command: Adding", rawType);

      // Find metadata (color/icon) from your palette with case-insensitive search
      let paletteItem = null;
      let matchedType = rawType; // Default to raw string

      Object.values(CATEGORIZED_PALETTE).forEach(cat => {
        const found = cat.items.find(i => i.type.toLowerCase() === rawType.toLowerCase());
        if (found) {
          paletteItem = { ...found, color: cat.color };
          matchedType = found.type; // Use the canonical type name (e.g. "DHT22" not "dht22")
        }
      });

      // Default fallback if AI guesses a type not in our specific palette list
      if (!paletteItem) {
          console.warn(`Type ${rawType} not in palette, using default.`);
          paletteItem = { label: rawType, color: '#ffffff', icon: '📦' };
      }

      const newComp = {
        id: `${matchedType.toLowerCase()}_${Date.now()}_ai`,
        type: matchedType,
        label: paletteItem.label,
        // Place in center with slight random offset
        position: {
          x: 400 + (Math.random() * 60 - 30),
          y: 300 + (Math.random() * 60 - 30)
        },
        connectedPin: null,
        color: paletteItem.color,
        icon: paletteItem.icon
      };

      setComponents(prev => [...prev, newComp]);
    };

    // 2. Handle "Auto-Wire" (Fuzzy ID Matching)
    const handleAIWire = (e) => {
      const connections = e.detail;
      console.log("🎨 AI Command: Wiring", connections);

      setWires(prevWires => {
        const newWires = [];
        
        connections.forEach(conn => {
          // SMART LOOKUP: Try exact ID first, then fallback to Type match
          let sourceComp = components.find(c => c.id === conn.fromComponent);
          let targetComp = components.find(c => c.id === conn.toComponent);

          // Fallback: If AI sent a short type ID (e.g. "dht22") but we have "dht22_123"
          if (!sourceComp) {
             sourceComp = components.find(c => c.type.toLowerCase() === conn.fromComponent.split('_')[0].toLowerCase());
          }
          if (!targetComp) {
             targetComp = components.find(c => c.type.toLowerCase() === conn.toComponent.split('_')[0].toLowerCase());
          }

          if (sourceComp && targetComp) {
            console.log(`⚡ Wiring ${sourceComp.label} (${conn.fromPin}) -> ${targetComp.label} (${conn.toPin})`);
            
            const startPos = getGlobalPinCoordinates(conn.fromPin, sourceComp);
            const endPos = getGlobalPinCoordinates(conn.toPin, targetComp);
            const midX = (startPos.x + endPos.x) / 2;

            const path = [
              startPos,
              { x: midX, y: startPos.y },
              { x: midX, y: endPos.y },
              endPos
            ];

            newWires.push({
              id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              from: { component: sourceComp.id, pin: conn.fromPin },
              to:   { component: targetComp.id, pin: conn.toPin },
              status: 'VALID', 
              path: path
            });
          } else {
            console.warn("❌ Could not find components for wiring:", conn);
          }
        });
        return [...prevWires, ...newWires];
      });
    };

    // Attach listeners
    document.addEventListener('circuit:add', handleAIAdd);
    document.addEventListener('circuit:autowire', handleAIWire);

    return () => {
      document.removeEventListener('circuit:add', handleAIAdd);
      document.removeEventListener('circuit:autowire', handleAIWire);
    };
  }, [components]); // Depend on components for wiring lookup

  const activePins = useMemo(() => {
    const set = new Set();
    components.forEach(comp => {
      const connectedWires = wires.filter(w => w.to.component === comp.id || w.from.component === comp.id);
      connectedWires.forEach(w => {
        const otherEnd = w.to.component === comp.id ? w.from : w.to;
        const originComp = components.find(c => c.id === otherEnd.component);
        if(originComp && originComp.type === 'ESP32') {
          const pinStr = otherEnd.pin.replace(/\D/g, '');
          const pinNum = Number(pinStr);
          if (Number.isFinite(pinNum) && simState.pins?.[pinNum] === 1) {
            set.add(otherEnd.pin);
          }
        }
      });
    });
    return set;
  }, [components, wires, simState]);

  const pinStatus = useMemo(() => {
    const map = new Map();
    wires.forEach(w => {
      if (w.to && w.to.pin) map.set(w.to.pin, w.status);
    });
    return map;
  }, [wires]);

  const handlePotInteraction = (e, compId) => {
    const currentVal = potValues[compId] || 0;
    const step = 10;
    const newVal = e.shiftKey ? Math.max(0, currentVal - step) : Math.min(270, currentVal + step);
    setPotValues(prev => ({ ...prev, [compId]: newVal }));
    const adcValue = Math.floor((newVal / 270) * 1023);
    if (window.__updateEnv) {
      window.__updateEnv(null, adcValue, compId);
    }
  };

  const handlePaletteDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = 'copy';
    setDragging(item);
  };

  const handleCanvasDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };

  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault();
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapToGrid(e.clientX - rect.left);
    const y = snapToGrid(e.clientY - rect.top);
    const newComp = { id: `comp_${Date.now()}`, type: dragging.type, label: dragging.label, position: { x, y }, connectedPin: null, color: dragging.color, icon: dragging.icon };
    
    setComponents(prev => [...prev, newComp]);
    const event = new CustomEvent('component:added', { detail: newComp });
    document.dispatchEvent(event);
    setDragging(null);
  }, [dragging]);

  const handleCanvasMouseDown = (e) => {
    if (e.target.id === 'canvas-bg') {
      setSelectedItem(null);
      setSelectedSketchIndex(null);
    }
    if (sketchMode) {
      setIsDrawing(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const newPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setSketchPath(prev => [...prev, [newPoint]]);
    }
  };

  const handleGlobalMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (sketchMode && isDrawing) {
      const newPoint = { x: mouseX, y: mouseY };
      setSketchPath(prev => {
        if (prev.length === 0) return [[newPoint]];
        const newStrokes = [...prev];
        const lastStroke = newStrokes[newStrokes.length - 1];
        newStrokes[newStrokes.length - 1] = [...lastStroke, newPoint];
        return newStrokes;
      });
      return;
    }

    if (movingSketchIndex !== null && sketchDragStart) {
      const dx = mouseX - sketchDragStart.x;
      const dy = mouseY - sketchDragStart.y;
      setSketchPath(prev => {
        const newStrokes = [...prev];
        newStrokes[movingSketchIndex] = newStrokes[movingSketchIndex].map(p => ({
          x: p.x + dx,
          y: p.y + dy
        }));
        return newStrokes;
      });
      setSketchDragStart({ x: mouseX, y: mouseY });
      return;
    }

    if (movingComp) {
      const newX = snapToGrid(mouseX - dragOffset.x);
      const newY = snapToGrid(mouseY - dragOffset.y);
      setComponents(prev => prev.map(c => 
        c.id === movingComp ? { ...c, position: { x: newX, y: newY } } : c
      ));

      setWires(prevWires => prevWires.map(wire => {
        const isFrom = wire.from.component === movingComp;
        const isTo = wire.to.component === movingComp;
        if (!isFrom && !isTo) return wire;

        const currentComps = componentsRef.current;
        const fromComp = isFrom
          ? { ...currentComps.find(c => c.id === movingComp), position: { x: newX, y: newY } }
          : currentComps.find(c => c.id === wire.from.component);
        const toComp = isTo
          ? { ...currentComps.find(c => c.id === movingComp), position: { x: newX, y: newY } }
          : currentComps.find(c => c.id === wire.to.component);

        if (!fromComp || !toComp) return wire;

        const startPos = getGlobalPinCoordinates(wire.from.pin, fromComp);
        const endPos = getGlobalPinCoordinates(wire.to.pin, toComp);
        return { ...wire, path: computeWirePath(startPos, endPos) };
      }));
    }

    if (draggingVertex) {
      const snappedX = snapToGrid(mouseX);
      const snappedY = snapToGrid(mouseY);
      setWires(prevWires => prevWires.map(wire => {
        if (wire.id === draggingVertex.wireId) {
          const newPath = [...wire.path];
          newPath[draggingVertex.index] = { x: snappedX, y: snappedY };
          return { ...wire, path: newPath };
        }
        return wire;
      }));
    }
  };

  const handleGlobalMouseUp = () => {
    setMovingComp(null);
    setDraggingVertex(null); 
    setMovingSketchIndex(null);
    setSketchDragStart(null);
    setIsDrawing(false);
  };

  const handleRecognize = async () => {
    const allPoints = sketchPath.flat();
    let x, y, w, h;
    if (allPoints.length > 0) {
      const xs = allPoints.map(p => p.x);
      const ys = allPoints.map(p => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      x = minX; y = minY;
      w = Math.max(...xs) - minX; h = Math.max(...ys) - minY;
    } else {
      if (!sketchLabel) { alert("Draw something or type a label!"); return; }
      x = 400; y = 300; w = 100; h = 100;
    }
    setRecognizing(true);
    try {
      if (!recognizerRef.current) {
        recognizerRef.current = new SketchRecognizer(canvasRef.current, orchestrator);
      }
      const newComponent = await recognizerRef.current.recognizeRegion(x, y, w, h, sketchLabel);
      if (newComponent) {
        setComponents(prev => [...prev, newComponent]);
        const event = new CustomEvent('component:added', { detail: newComponent });
        document.dispatchEvent(event);
      }
    } catch (err) {
      console.error("Recognition failed:", err);
      alert("Error recognizing component. Check console.");
    } finally {
      setSketchPath([]);
      setSketchLabel('');
      setSelectedSketchIndex(null);
      setRecognizing(false);
      setSketchMode(false);
      setIsDrawing(false);
    }
  };

  const handleComponentMouseDown = (e, comp) => {
    e.stopPropagation();
    setSelectedItem({ type: 'comp', id: comp.id });
    setSelectedSketchIndex(null); 
    
    if (wireMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setMovingComp(comp.id);
  };

  const handlePinClick = async (e, pinName, componentId, coords) => {
    if (typeof e === 'string') {
      coords = componentId;
      componentId = pinName;
      pinName = e;
      e = null;
    }
    
    if (!pinName || typeof pinName !== 'string') {
      console.warn('⚠️ handlePinClick: invalid pinName', pinName);
      return;
    }

    console.log('📍 Pin clicked:', pinName, 'on component:', componentId, 'wireMode:', wireMode);
    
    if (!wireMode) return;
    if (e) e.stopPropagation();

    const comp = components.find(c => c.id === componentId);
    if (!comp) return;

    let exactX, exactY;
    
    if (coords && coords.screenX && coords.screenY && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      exactX = coords.screenX - rect.left;
      exactY = coords.screenY - rect.top;
    } else {
      const global = getGlobalPinCoordinates(pinName, comp);
      exactX = global.x;
      exactY = global.y;
    }

    if (!wireStart) {
      setWireStart({ x: exactX, y: exactY, component: componentId, pinName: pinName });
      return;
    }

    const sourceComp = components.find(c => c.id === wireStart.component);
    const destComp = components.find(c => c.id === componentId);
    
    if (!sourceComp || !destComp) { 
      setWireStart(null); 
      return; 
    }

    let status = STATUS.VALID;
    if (destComp.type === 'ESP32') {
      if (!doctorRef.current) {
        alert('Validation system not ready. Please wait.');
        setWireStart(null);
        return;
      }
      const result = await doctorRef.current.validate(sourceComp, pinName, 'ESP32');
      status = result.status;
      if (status === STATUS.BLOCKED) {
        setValidationModal(result);
        setWireStart(null);
        return;
      }
    }

    setWires(prev => {
      const startPos = getGlobalPinCoordinates(wireStart.pinName, sourceComp);
      const endPos = getGlobalPinCoordinates(pinName, destComp);
      
      return [...prev, {
        id: `wire_${Date.now()}`,
        from: { component: sourceComp.id, pin: wireStart.pinName },
        to:   { component: destComp.id, pin: pinName },
        status: status,
        path: computeWirePath(startPos, endPos)
      }];
    });

    const event = new CustomEvent('wire:connected');
    document.dispatchEvent(event);
    setWireStart(null);
  };

  const makePinHandler = (compId) => (eventOrPin, maybePin) => {
    if (typeof eventOrPin === 'string') {
      handlePinClick(null, eventOrPin, compId);
    } else {
      handlePinClick(eventOrPin, maybePin, compId);
    }
  };

  const renderGrid = () => (
    <svg id="canvas-bg" style={{ position: 'absolute', inset: 0 }} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
      <defs><pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse"><path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#2a2a3a" strokeWidth="0.5" /></pattern></defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );

  const isComponentHigh = (comp) => {
    const pinsArr = Array.isArray(simState?.pins) ? simState.pins : [];
    const connectedWires = wires.filter(w => w.to.component === comp.id || w.from.component === comp.id);
    if (connectedWires.length === 0) return false;

    for (const wire of connectedWires) {
      let esp32Pin = null;
      if (wire.from.component === comp.id) {
        const targetComp = components.find(c => c.id === wire.to.component);
        if (targetComp && targetComp.type === 'ESP32') esp32Pin = wire.to.pin;
      }
      if (wire.to.component === comp.id) {
        const sourceComp = components.find(c => c.id === wire.from.component);
        if (sourceComp && sourceComp.type === 'ESP32') esp32Pin = wire.from.pin;
      }
      if (!esp32Pin) continue;

      const pinStr = String(esp32Pin).replace(/[^0-9]/g, '');
      const pinNum = parseInt(pinStr, 10);
      if (Number.isFinite(pinNum) && pinsArr[pinNum] === 1) return true;
    }
    return false;
  };

  const getConnectedPin = (compId) => {
    const wire = wires.find(w => 
      (w.from.component === compId && w.to.component === 'master_esp32') || 
      (w.to.component === compId && w.from.component === 'master_esp32')
    );
    if (!wire) return null;
    const pinStr = (wire.to.component === 'master_esp32') ? wire.to.pin : wire.from.pin;
    return parseInt(pinStr.replace(/\D/g, ''), 10);
  };

  // ✨ WOKWI-STYLE ANIMATIONS
  const getAnimationFilter = (comp, isHigh) => {
    if (!isSimulating) {
      return isHigh ? 'drop-shadow(0 0 15px #FFD700) brightness(1.2)' : 'none';
    }

    // During simulation: Pulsing animation
    const pulse = Math.abs(Math.sin(animationFrame * 0.1));
    const brightness = 1 + (pulse * 0.3);
    const glowSize = 10 + (pulse * 10);
    
    return isHigh 
      ? `drop-shadow(0 0 ${glowSize}px #FFD700) brightness(${brightness})` 
      : 'none';
  };

  const renderComponents = () => components.map(comp => {
    const isSelected = selectedItem?.type === 'comp' && selectedItem.id === comp.id;
    const isHigh = isComponentHigh(comp);
    const pinHandler = makePinHandler(comp.id);
    
    const interactiveProps = { 
      onMouseDown: (e) => handleComponentMouseDown(e, comp), 
      style: { 
        position: 'absolute', left: comp.position.x, top: comp.position.y, zIndex: 10, 
        cursor: wireMode ? 'crosshair' : 'grab', 
        filter: isSelected 
          ? 'drop-shadow(0 0 5px #00e676)' 
          : getAnimationFilter(comp, isHigh),
        // ✨ Add smooth transition
        transition: isSimulating ? 'filter 0.1s ease-out' : 'none'
      } 
    };

    const sensorStyle = { ...interactiveProps.style, transform: `scale(${SENSOR_SCALE})`, transformOrigin: 'top left' };

    if (comp.type === 'POTENTIOMETER') {
      const rotation = potValues[comp.id] || 0;
      return (
        <div key={comp.id} onMouseDown={(e)=>!wireMode && handleComponentMouseDown(e,comp)} onClick={(e)=>!wireMode && handlePotInteraction(e,comp.id)}
             style={{position:'absolute', left:comp.position.x, top:comp.position.y, zIndex:20, transform:`rotate(${rotation}deg)`}}>
          <PotentiometerSensor onPinClick={pinHandler} />
        </div>
      );
    }
    if (comp.type === 'SERVO') {
      const angle = simState.env?.servos?.[comp.id] || 0;
      return <div key={comp.id} {...interactiveProps} style={sensorStyle}><ServoMotor onPinClick={pinHandler} angle={angle} /></div>;
    }
    if (comp.type === 'DC_MOTOR') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><DCMotor onPinClick={pinHandler} isOn={isHigh} /></div>;
    if (comp.type === 'LED') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><LEDSensor onPinClick={pinHandler} isOn={isHigh} /></div>;
    if (comp.type === 'RGB_LED') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><RGBLEDSensor onPinClick={pinHandler} isOn={isHigh} /></div>;
    if (comp.type === 'NEOPIXEL') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><NeoPixelRing onPinClick={pinHandler} isOn={isHigh} /></div>;
    if (comp.type === 'RELAY') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><RelayModule onPinClick={pinHandler} isOn={isHigh} /></div>;
    if (comp.type === 'SWITCH') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><SwitchComponent onPinClick={pinHandler} /></div>;
    if (comp.type === 'BUTTON') {
      return (
        <div key={comp.id} {...interactiveProps}
          style={sensorStyle}
          onMouseDown={(e) => {
            if (!wireMode) {
              handleComponentMouseDown(e, comp);
              const pin = getConnectedPin(comp.id);
              if (pin !== null && window.__simSetInput) window.__simSetInput(pin, 0);
            }
          }}
          onMouseUp={() => {
            if (!wireMode) {
              const pin = getConnectedPin(comp.id);
              if (pin !== null && window.__simSetInput) window.__simSetInput(pin, 1);
            }
          }}
          onMouseLeave={() => {
            if (!wireMode) {
              const pin = getConnectedPin(comp.id);
              if (pin !== null && window.__simSetInput) window.__simSetInput(pin, 1);
            }
          }}
        >
          <PushButton onPinClick={pinHandler} />
        </div>
      );
    }

    if (comp.type === 'OLED') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><OLEDDisplay onPinClick={pinHandler} isOn={isHigh} text={simState.env?.oled_text || "Ready"} /></div>;
    if (comp.type === 'SEVEN_SEG') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><SevenSegment onPinClick={pinHandler} isOn={isHigh} value={simState.env?.seven_seg_value || "8888"} /></div>;
    if (comp.type === 'LCD') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><LCD1602 onPinClick={pinHandler} text={simState.env?.lcd_text || ["Ready", ""]} /></div>;

    if (comp.type === 'DS18B20') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><DS18B20Sensor onPinClick={pinHandler} env={simState.env} /></div>;
    if (comp.type === 'DHT11') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><DHT11Sensor onPinClick={pinHandler} env={simState.env} /></div>;
    if (comp.type === 'DHT22') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><DHT22Sensor onPinClick={pinHandler} env={simState.env} /></div>;
    if (comp.type === 'BME280') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><BME280Sensor onPinClick={pinHandler} env={simState.env} /></div>;
    if (comp.type === 'BMP280') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><BMP280Sensor onPinClick={pinHandler} env={simState.env} /></div>;
    if (comp.type === 'LDR') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><LDRSensor onPinClick={pinHandler} env={simState.env} /></div>;
    if (comp.type === 'BH1750') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><BH1750Sensor onPinClick={pinHandler} lux={simState.env?.lux} /></div>;
    if (comp.type === 'NTC') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><NTCSensor onPinClick={pinHandler} env={simState.env} /></div>;

    if (comp.type === 'ESP32') { 
      return (
        <div key={comp.id} {...interactiveProps} style={{ ...interactiveProps.style, transform: `scale(${BOARD_SCALE})`, transformOrigin: 'top left' }}> 
          <ESP32BoardRealistic 
            wireMode={wireMode} 
            activePins={activePins} 
            pinStatus={pinStatus} 
            onPinClick={(e, pin, coords) => handlePinClick(e, pin, comp.id, coords)} 
          /> 
        </div>
      ); 
    }

    if (comp.type === 'DC_SUPPLY') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><DCPowerSupply onPinClick={pinHandler} /></div>;
    if (comp.type === 'LI_ION') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><LiIonBattery onPinClick={pinHandler} /></div>;
    if (comp.type === 'KEYPAD') return <div key={comp.id} {...interactiveProps} style={sensorStyle}><Keypad onPinClick={pinHandler} /></div>;
    
    return (
      <div key={comp.id} {...interactiveProps} style={{ ...interactiveProps.style, width: 120, background: '#16162a', border: isSelected ? '2px solid #00e676' : `2px solid ${comp.color || '#aaa'}`, borderRadius: 6, padding: '6px 8px', color: '#fff', fontSize: 11, fontFamily: 'monospace', userSelect: 'none', transition: 'all 0.1s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>{comp.icon || '❓'}</span>
          <span style={{ fontSize: 9, color: '#666' }}>{comp.connectedPin || 'unwired'}</span>
        </div>
        <div style={{ marginTop: 2, color: comp.color, fontWeight: 'bold', fontSize: 10 }}>{comp.label}</div>
      </div>
    );
  });

  const renderSketch = () => {
    if (!sketchMode || sketchPath.length === 0) return null;

    return (
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 25 }} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        {sketchPath.map((stroke, strokeIndex) => {
          if (!stroke || stroke.length === 0) return null;
          
          const isSelected = selectedSketchIndex === strokeIndex;
          const pathData = stroke.map((point, i) => 
            `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
          ).join(' ');

          return (
            <g key={strokeIndex}>
              <path d={pathData} fill="none" stroke="transparent" strokeWidth={20}
                style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                onClick={(e) => { e.stopPropagation(); setSelectedSketchIndex(strokeIndex); }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedSketchIndex(strokeIndex);
                  setMovingSketchIndex(strokeIndex);
                  const rect = canvasRef.current.getBoundingClientRect();
                  setSketchDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
              />
              <path d={pathData} fill="none" stroke={isSelected ? '#ffeb3b' : '#ff9f43'} 
                strokeWidth={isSelected ? 4 : 3} strokeLinecap="round" strokeLinejoin="round" opacity={0.9}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(255, 159, 67, 0.5))' }}
              />
              {isSelected && stroke.length > 0 && (
                <>
                  <circle cx={stroke[0].x} cy={stroke[0].y} r={6} fill="#ff9f43" stroke="#fff" strokeWidth={2} />
                  <circle cx={stroke[stroke.length-1].x} cy={stroke[stroke.length-1].y} r={6} fill="#ff9f43" stroke="#fff" strokeWidth={2} />
                </>
              )}
            </g>
          );
        })}
        {sketchLabel && sketchPath.length > 0 && (
          <text x={sketchPath[0]?.[0]?.x || 100} y={(sketchPath[0]?.[0]?.y || 100) - 10} 
            fill="#ff9f43" fontSize="14" fontWeight="bold" style={{ pointerEvents: 'none' }}>
            "{sketchLabel}"
          </text>
        )}
      </svg>
    );
  };

  // ✨ ANIMATED WIRES (flowing particles during simulation)
  const renderWires = () => {
    const getPathString = (points) => {
      if (!points || points.length === 0) return '';
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    };

    return (
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <defs>
          {/* ✨ Flowing gradient for active wires */}
          <linearGradient id="flowingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e676" stopOpacity="0">
              <animate attributeName="offset" values="0;1" dur="1s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#00e676" stopOpacity="1">
              <animate attributeName="offset" values="0;1" dur="1s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#00e676" stopOpacity="0">
              <animate attributeName="offset" values="0;1" dur="1s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {wires.map((wire) => {
          if (!wire.path || wire.path.length === 0) return null;
          
          const d = getPathString(wire.path);
          const isSelected = selectedItem?.type === 'wire' && selectedItem.id === wire.id;
          const color = WIRE_COLORS[wire.status] || '#888';

          // Check if wire is carrying current
          const fromComp = components.find(c => c.id === wire.from.component);
          const toComp = components.find(c => c.id === wire.to.component);
          const isActive = isComponentHigh(fromComp) || isComponentHigh(toComp);

          return (
            <g key={wire.id} onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'wire', id: wire.id }); setSelectedSketchIndex(null); }} style={{ cursor: 'pointer', pointerEvents: 'stroke' }}>
              <path d={d} fill="none" stroke="transparent" strokeWidth={15} />
              
              {/* ✨ Base wire */}
              <path d={d} fill="none" stroke={isSelected ? '#ffeb3b' : color} 
                strokeWidth={isSelected ? 4 : 3} strokeLinecap="round" strokeLinejoin="round" 
                opacity={isSimulating && isActive ? 0.6 : 0.8} />
              
              {/* ✨ Flowing animation overlay when simulating and active */}
              {isSimulating && isActive && (
                <path d={d} fill="none" stroke="url(#flowingGradient)" 
                  strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" 
                  opacity={0.8} 
                  style={{ filter: 'drop-shadow(0 0 3px #00e676)' }} />
              )}
              
              <circle cx={wire.path[0].x} cy={wire.path[0].y} r={4} fill={color} />
              <circle cx={wire.path[wire.path.length-1].x} cy={wire.path[wire.path.length-1].y} r={4} fill={color} />

              {isSelected && wire.path.map((point, index) => {
                if (index === 0 || index === wire.path.length - 1) return null;
                return (
                  <circle key={index} cx={point.x} cy={point.y} r={6} fill="#ffeb3b" stroke="#000" strokeWidth={1}
                    style={{ cursor: 'move', pointerEvents: 'auto' }}
                    onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex({ wireId: wire.id, index }); }}
                  />
                );
              })}
            </g>
          );
        })}
        
        {wireMode && wireStart && (
          <>
            <circle cx={wireStart.x} cy={wireStart.y} r={8} fill="#ff6b6b" stroke="#fff" strokeWidth={2} />
            <text x={wireStart.x + 15} y={wireStart.y - 10} fill="#ff6b6b" fontSize="12" fontWeight="bold">
              Click pin to connect
            </text>
          </>
        )}
      </svg>
    );
  };

  const renderSimOverlay = () => {
    // Helper to safely handle updates
    const handleEnvChange = (key, value) => {
      // 1. Convert to number (sliders return strings)
      const numVal = parseInt(value, 10);
      setSimState(prev => ({
        ...prev,
        env: { ...prev.env, [key]: numVal }
      }));
      if (window.__updateEnv) {
        window.__updateEnv(key, numVal);
      }
    };

    return (
      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        <button 
          onClick={() => setShowSimControls(!showSimControls)}
          style={{ background: '#3a86ff', color: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
          {showSimControls ? '▼ Hide Controls' : '🌍 Environment'}
        </button>

        {showSimControls && (
          <div style={{ width: 220, background: 'rgba(20,20,30,0.9)', border: '1px solid #3a86ff', borderRadius: 8, padding: 15, color: 'white', backdropFilter: 'blur(5px)' }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#3a86ff', marginBottom: 10 }}>🌍 CONDITIONS</div>
            
            {/* TEMPERATURE */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Temperature</span> <span>{simState.env?.temperature ?? 25}°C</span>
              </div>
              <input 
                type="range" min="-10" max="50" 
                // Fix: Use a fallback to 25 to prevent "uncontrolled" errors
                value={simState.env?.temperature ?? 25}
                onInput={(e) => handleEnvChange('temperature', e.target.value)}
                style={{ width: '100%', accentColor: '#ff6b6b', cursor: 'pointer' }} 
              />
            </div>

            {/* SUNLIGHT */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Sunlight (Lux)</span> <span>{simState.env?.lux ?? 500}</span>
              </div>
              <input 
                type="range" min="0" max="1000" 
                value={simState.env?.lux ?? 500}
                onInput={(e) => handleEnvChange('lux', e.target.value)}
                style={{ width: '100%', accentColor: '#feca57', cursor: 'pointer' }} 
              />
            </div>

            {/* HUMIDITY */}
            <div>
              <div style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Humidity</span> <span>{simState.env?.humidity ?? 50}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={simState.env?.humidity ?? 50}
                onInput={(e) => handleEnvChange('humidity', e.target.value)}
                style={{ width: '100%', accentColor: '#54a0ff', cursor: 'pointer' }} 
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f1a', color: '#fff', fontFamily: "monospace", overflow:'hidden' }}
         onMouseDown={handleCanvasMouseDown} onMouseMove={handleGlobalMouseMove} onMouseUp={handleGlobalMouseUp}>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* Left Sidebar */}
      <div style={{ width: 180, background: '#12121f', borderRight: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', zIndex: 30, height: '100%' }}>
        <div style={{ padding: '12px 12px 0 12px', borderBottom: '1px solid #2a2a3a', background: '#12121f', flexShrink: 0 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#888', marginBottom: 4, fontWeight: 'bold' }}>WIRING</div>
            <button onClick={(e) => { e.stopPropagation(); setWireMode(!wireMode); setSketchMode(false); setWireStart(null); }}
              style={{ width: '100%', background: wireMode ? '#00e676' : '#1a1a2e', color: wireMode ? '#000' : '#fff', border: `1px solid ${wireMode ? '#00e676' : '#2a2a3a'}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
              🔌 {wireMode ? 'Wire Mode ON' : 'Wire Mode'}
            </button>
            {wireMode && (
              <div style={{ fontSize: 9, color: '#00e676', marginTop: 6, padding: '4px', background: 'rgba(0,230,118,0.1)', borderRadius: 4 }}>
                ✓ Click pins to connect
              </div>
            )}
          </div>
          <hr style={{ borderColor: '#2a2a3a', opacity: 0.5, margin: '6px 0' }} />
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: '#888', marginBottom: 4, fontWeight: 'bold' }}>CREATION</div>
            <button onClick={(e) => { e.stopPropagation(); setSketchMode(!sketchMode); setWireMode(false); }}
              style={{ width: '100%', background: sketchMode ? '#ff9f43' : '#1a1a2e', color: sketchMode ? '#000' : '#fff', border: `1px solid ${sketchMode ? '#ff9f43' : '#2a2a3a'}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold', marginBottom: 6 }}>
              ✏️ {sketchMode ? 'Sketch Mode ON' : 'Sketch Mode'}
            </button>
            {sketchMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input type="text" placeholder="Label (e.g. Fan)" value={sketchLabel} onChange={e => setSketchLabel(e.target.value)} style={{ background: '#0f0f1a', border: '1px solid #2a2a3a', borderRadius: 4, padding: '4px', color: '#fff', fontSize: 11 }} />
                <button onClick={handleRecognize} disabled={recognizing || (sketchPath.flat().length < 5 && !sketchLabel)} style={{ background: recognizing ? '#333' : '#ff9f43', color: '#000', border: 'none', borderRadius: 4, padding: '4px', cursor: recognizing ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 'bold' }}>{recognizing ? '⏳' : '🔍'}</button>
                <button onClick={() => setSketchPath([])} style={{ background: '#2a2a3a', color: '#fff', border: 'none', borderRadius: 4, padding: '4px', cursor: 'pointer', fontSize: 10 }}>Clear</button>
              </div>
            )}
          </div>
        </div>

        <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '12px 12px 80px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#3a86ff', letterSpacing: 1, marginBottom: 8 }}>COMPONENTS</div>
          {Object.entries(CATEGORIZED_PALETTE).map(([key, category]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: category.color, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>{category.label}</div>
              {category.items.map(item => (
                <div key={item.type} draggable onDragStart={(e) => handlePaletteDragStart(e, { ...item, color: category.color })}
                  style={{ background: '#1a1a2e', border: `1px solid ${category.color}44`, borderRadius: 6, padding: '8px 10px', cursor: 'grab', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div><div style={{ fontSize: 11, color: '#fff' }}>{item.label}</div><div style={{ fontSize: 9, color: '#555' }}>{item.type}</div></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
        <div id="canvas-bg" style={{ width: '100%', height: '100%', cursor: sketchMode ? 'crosshair' : (wireMode ? 'crosshair' : 'default'), background: '#0d0d1a' }}
          onDrop={handleCanvasDrop} onDragOver={handleCanvasDragOver}>
          {renderGrid()}
          {renderComponents()} 
          {renderWires()}
          {renderSketch()}
          {renderSimOverlay()}
        </div>
      </div>

      {/* Validation Modal */}
      {validationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setValidationModal(null)}>
          <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, maxWidth: 500, width: '90%', border: `2px solid ${WIRE_COLORS[validationModal.status]}`, boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
              <span style={{ fontSize: 24 }}>{validationModal.status === STATUS.BLOCKED ? '⛔' : '⚠️'}</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Connection {validationModal.status === STATUS.BLOCKED ? 'Blocked' : 'Warning'}</div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 'normal' }}>
                  {validationModal.aiContext ? '🤖 AI-POWERED DIAGNOSIS' : 'HARDWARE SAFETY GUARD'}
                </div>
              </div>
            </div>
            <div style={{ color: '#ff5252', fontSize: 14, marginBottom: 16, lineHeight: 1.5, background: '#ff525211', padding: 12, borderRadius: 6, border: '1px solid #ff525233' }}>
              {validationModal.error}
            </div>
            {validationModal.aiContext && validationModal.aiContext.explanation && (
              <div style={{ background: '#3a86ff11', border: '1px solid #3a86ff33', borderRadius: 6, padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#3a86ff', fontWeight: 'bold', marginBottom: 6 }}>💡 WHY THIS MATTERS</div>
                <div style={{ color: '#e0e0e0', fontSize: 13, lineHeight: 1.5 }}>{validationModal.aiContext.explanation}</div>
              </div>
            )}
            <div style={{ color: '#e0e0e0', fontSize: 13, marginBottom: 8 }}>
              <b>Solution:</b> {validationModal.aiContext?.alternativesReason || validationModal.suggestion}
            </div>
            {((validationModal.aiContext?.alternatives?.length > 0) || (validationModal.suggestedPins?.length > 0)) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {(validationModal.aiContext?.alternatives || validationModal.suggestedPins).map(pin => (
                  <span key={pin} style={{ background: '#00e67622', color: '#00e676', border: '1px solid #00e676', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>
                    GPIO {pin}
                  </span>
                ))}
              </div>
            )}
            {validationModal.aiContext?.proTip && (
              <div style={{ marginTop: 16, background: '#ff9f4311', border: '1px solid #ff9f4333', borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 10, color: '#ff9f43', fontWeight: 'bold', marginBottom: 4 }}>⚡ PRO TIP</div>
                <div style={{ color: '#ddd', fontSize: 12, lineHeight: 1.4 }}>{validationModal.aiContext.proTip}</div>
              </div>
            )}
            <button onClick={() => setValidationModal(null)} style={{ marginTop: 24, width: '100%', background: '#3a3a4a', color: '#fff', border: 'none', borderRadius: 6, padding: '12px', cursor: 'pointer', fontSize: 13, fontWeight: 'bold', transition: 'background 0.2s' }}>
              Understood, I'll fix it.
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
