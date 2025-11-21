'use client';

import { useState, useEffect } from 'react';
import { useUssdSession } from '@/hooks/useUssdSession';

export default function Home() {
  const [statusTime, setStatusTime] = useState('12:30');
  const [phoneInput, setPhoneInput] = useState('886123412');

  const { display, setPhoneNumber, handleKeyPress, resetSession } = useUssdSession('+231' + phoneInput);

  // 전화번호 변경 시 세션에 반영
  useEffect(() => {
    const normalized = '+231' + phoneInput.replace(/\s/g, '');
    setPhoneNumber(normalized);
  }, [phoneInput, setPhoneNumber]);

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

  const onKeyClick = (key: string) => {
    handleKeyPress(key);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-5 relative">
      <div className="flex gap-20 max-w-[1400px] w-full items-center">
        {/* Tecno T901 Phone */}
        <div className="tecno-phone relative">
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

              <div className="ussd-display">{display}</div>
            </div>
          </div>

          {/* T9 Keypad */}
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {keypadData.map((item) => (
              <button
                key={item.key}
                className={`key mx-auto ${item.className || ''}`}
                onClick={() => onKeyClick(item.key)}
              >
                <span className="text-base leading-none flex items-center gap-2">{item.key}</span>
                {item.letters && (
                  <span className="text-[8px] text-[#aaa] absolute right-1.5 top-1/2 -translate-y-1/2">
                    {item.letters}
                  </span>
                )}
              </button>
            ))}
            <button className="key key-send mx-auto" onClick={() => onKeyClick('send')}>
              <span className="text-base">📞</span>
            </button>
            <button className="key key-center mx-auto" onClick={() => onKeyClick('ok')}>
              <span className="text-[11px]">OK</span>
            </button>
            <button className="key key-end mx-auto" onClick={() => onKeyClick('backspace')}>
              <span className="text-base">←</span>
            </button>
          </div>

          <div className="text-center text-[#888] text-[9px] mt-1.5 font-bold tracking-[3px]">TECNO</div>

          {/* Reset Button */}
          <button
            onClick={resetSession}
            className="absolute -bottom-12 right-0 px-4 py-2 bg-[#e74c3c] text-white text-xs font-bold rounded hover:bg-[#c0392b] transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Info Panel */}
        <div className="info-panel">
          <h2 className="mb-0 pb-0 border-0">USSD Simulator - Tecno T901</h2>

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
            <p>2. Type *123# on the keypad</p>
            <p>3. Press 📞 (call button) to connect</p>
            <p>4. Press OK to submit input</p>
            <p>5. Press ← to delete</p>
            <p>6. Press 0 + OK to go back</p>
          </div>

          {/* Phone Number Input */}
          <div className="scenario-selector">
            <label className="block mb-2 font-bold text-[#2c3e50]">Enter Phone Number:</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-2 border-[#3498db] rounded cursor-not-allowed opacity-80">
                <svg width="24" height="16" viewBox="0 0 24 16" className="rounded-sm">
                  <rect width="24" height="5.33" fill="#002868" />
                  <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
                  <rect y="10.66" width="24" height="5.34" fill="#BF0A30" />
                  <rect width="10" height="8" fill="#002868" />
                  <polygon
                    points="5,1 5.5,2.5 7,2.5 5.75,3.5 6.25,5 5,4 3.75,5 4.25,3.5 3,2.5 4.5,2.5"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="777 123 456"
                className="flex-1 p-2.5 border-2 border-[#3498db] rounded text-sm outline-none focus:border-[#2980b9]"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
