'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [statusTime, setStatusTime] = useState('12:30');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setStatusTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const keypadData = [
    { key: '1', letters: '' },
    { key: '2', letters: 'ABC' },
    { key: '3', letters: 'DEF' },
    { key: '4', letters: 'GHI' },
    { key: '5', letters: 'JKL' },
    { key: '6', letters: 'MNO' },
    { key: '7', letters: 'PQRS' },
    { key: '8', letters: 'TUV' },
    { key: '9', letters: 'WXYZ' },
    { key: '*', letters: '+', className: 'key-action' },
    { key: '0', letters: '_' },
    { key: '#', letters: '', className: 'key-action' },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="flex gap-10 max-w-[1400px] w-full items-center">
        {/* Tecno T901 Phone */}
        <div className="tecno-phone">
          <div className="w-10 h-[3px] bg-[#222] rounded-sm mx-auto mb-2.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />

          <div className="screen-bezel">
            <div className="phone-screen">
              <div className="status-bar">
                <div className="flex gap-1 items-center">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
                <div className="font-bold">{statusTime}</div>
              </div>

              <div className="ussd-display">
                {`Welcome to USSD

Press * to dial *123#`}
              </div>

              <div className="action-bar">
                <span className="action-button">Options</span>
                <span className="action-button"></span>
                <span className="action-button">Back</span>
              </div>
            </div>
          </div>

          {/* T9 Keypad */}
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {keypadData.map((item) => (
              <button key={item.key} className={`key mx-auto ${item.className || ''}`}>
                <span className="text-base leading-none flex items-center gap-2">{item.key}</span>
                {item.letters && (
                  <span className="text-[8px] text-[#aaa] absolute right-1.5 top-1/2 -translate-y-1/2">
                    {item.letters}
                  </span>
                )}
              </button>
            ))}
            <button className="key key-send mx-auto">
              <span className="text-base">📞</span>
            </button>
            <button className="key key-center mx-auto">
              <span className="text-[11px]">OK</span>
            </button>
            <button className="key key-end mx-auto">
              <span className="text-base">✕</span>
            </button>
          </div>

          <div className="text-center text-[#888] text-[9px] mt-1.5 font-bold tracking-[3px]">TECNO</div>
        </div>

        {/* Info Panel */}
        <div className="info-panel">
          <h2>USSD Simulator - Tecno T901</h2>

          <div className="device-info">
            <h3>Device Information</h3>
            <p>
              <strong>Model:</strong> Tecno T901
            </p>
            <p>
              <strong>OS:</strong> KaiOS 2.5
            </p>
            <p>
              <strong>Network:</strong> MTN Liberia
            </p>
            <p>
              <strong>USSD Code:</strong> *123#
            </p>
          </div>

          <div className="instruction-box">
            <p>
              <strong>How to use:</strong>
            </p>
            <p>1. Press * key to start dialing</p>
            <p>2. Type numbers on the keypad</p>
            <p>3. Press OK (center button) to submit</p>
            <p>4. Press ✕ (red button) to cancel/exit</p>
          </div>

          <div className="scenario-selector">
            <label className="block mb-2 font-bold text-[#2c3e50]">Select User Scenario:</label>
            <select className="w-full p-2.5 border-2 border-[#3498db] rounded text-sm">
              <option value="new">New User (First Time - PIN Setup)</option>
              <option value="existing">Existing User (Already Activated)</option>
            </select>
          </div>

          <div className="info-section">
            <h3>Current Session Status</h3>
            <span className="status-badge status-new">Not Started</span>
            <p>
              <strong>Phone Number:</strong> +231 777 123 456
            </p>
            <p>
              <strong>User Status:</strong> -
            </p>
            <p>
              <strong>Current State:</strong> IDLE
            </p>
          </div>

          <div className="info-section">
            <h3>Available Features</h3>
            <p>1. Check Balance - View wallet balance</p>
            <p>2. Transfer - Send funds to another user</p>
            <p>3. Exit - End USSD session</p>
          </div>

          <div className="info-section">
            <h3>Test Data</h3>
            <p>
              <strong>Test PIN:</strong> 1234
            </p>
            <p>
              <strong>Test Recipient Phone:</strong> +231 777 999 888
            </p>
            <p>
              <strong>Test Amount:</strong> 10
            </p>
            <p>
              <strong>Mock Balance:</strong> 100 USDC
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
