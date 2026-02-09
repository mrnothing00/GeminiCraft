import React, { useState } from 'react';
import ESP32BoardRealistic from './ESP32BoardRealistic.jsx';

/**
 * MINIMAL TEST CANVAS - Wire Mode Debugging
 * Use this to test if ESP32 pins are clickable
 */

export default function TestCanvas() {
  const [wireMode, setWireMode] = useState(false);
  const [wireStart, setWireStart] = useState(null);
  const [wires, setWires] = useState([]);
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    console.log(msg);
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const handlePinClick = (e, pinName, coords) => {
    addLog(`Pin clicked: ${pinName}`);

    if (!wireMode) {
      addLog('⚠️ Not in wire mode - ignored');
      return;
    }

    if (!wireStart) {
      // Start wire
      addLog(`✅ Wire START at pin ${pinName}`);
      setWireStart({ pin: pinName, component: 'ESP32' });
    } else {
      // Complete wire
      addLog(`✅ Wire END at pin ${pinName}`);
      const newWire = {
        id: `wire_${Date.now()}`,
        from: wireStart,
        to: { pin: pinName, component: 'ESP32' }
      };
      setWires(prev => [...prev, newWire]);
      addLog(`🔌 Wire created: ${wireStart.pin} → ${pinName}`);
      setWireStart(null);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#0f0f1a', 
      color: '#fff',
      fontFamily: 'monospace'
    }}>
      
      {/* Left Panel - Controls */}
      <div style={{ 
        width: 300, 
        background: '#12121f', 
        borderRight: '1px solid #2a2a3a',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        <h2 style={{ margin: 0, color: '#3a86ff' }}>Wire Mode Test</h2>
        
        <button
          onClick={() => {
            setWireMode(!wireMode);
            setWireStart(null);
            addLog(`Wire mode: ${!wireMode ? 'ON' : 'OFF'}`);
          }}
          style={{
            padding: '12px',
            background: wireMode ? '#00e676' : '#2a2a3a',
            color: wireMode ? '#000' : '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold'
          }}
        >
          {wireMode ? '🔌 Wire Mode ON' : '⭕ Wire Mode OFF'}
        </button>

        {wireStart && (
          <div style={{
            padding: 12,
            background: '#ff6b6b22',
            border: '1px solid #ff6b6b',
            borderRadius: 6
          }}>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>🎯 Wire Started</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>From: {wireStart.pin}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
              Click another pin to complete
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
            Wires ({wires.length})
          </div>
          {wires.length === 0 ? (
            <div style={{ fontSize: 11, color: '#666' }}>No wires yet</div>
          ) : (
            wires.map(wire => (
              <div 
                key={wire.id}
                style={{
                  padding: 8,
                  background: '#1a1a2e',
                  border: '1px solid #2a2a3a',
                  borderRadius: 4,
                  fontSize: 11,
                  marginBottom: 4
                }}
              >
                {wire.from.pin} → {wire.to.pin}
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => {
            setWires([]);
            setWireStart(null);
            addLog('🗑️ Cleared all wires');
          }}
          style={{
            padding: '8px',
            background: '#ff525222',
            color: '#ff5252',
            border: '1px solid #ff5252',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12
          }}
        >
          Clear All Wires
        </button>

        <div style={{ 
          flex: 1,
          background: '#0d0d1a',
          border: '1px solid #2a2a3a',
          borderRadius: 6,
          padding: 10,
          overflow: 'auto',
          fontSize: 10
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Console Log</div>
          {log.map((msg, i) => (
            <div key={i} style={{ marginBottom: 4, color: '#aaa' }}>{msg}</div>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
      }}>
        {wireMode && (
          <div style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: wireStart ? '#ff6b6b' : '#00e676',
            color: '#000',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            {wireStart 
              ? `🔌 Click destination pin` 
              : `🔌 Click a pin to start`
            }
          </div>
        )}

        <div style={{
          transform: 'scale(0.8)',
          cursor: wireMode ? 'crosshair' : 'default'
        }}>
          <ESP32BoardRealistic
            wireMode={wireMode}
            activePins={new Set()}
            pinStatus={new Map()}
            onPinClick={handlePinClick}
          />
        </div>
      </div>
    </div>
  );
}
