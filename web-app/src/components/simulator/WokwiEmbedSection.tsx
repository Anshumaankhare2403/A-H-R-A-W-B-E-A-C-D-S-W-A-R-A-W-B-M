import React, { useState } from 'react';
import { ExternalLink, Cpu, RefreshCw, Maximize2, Minimize2, Terminal, Info } from 'lucide-react';

export const WokwiEmbedSection: React.FC = () => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const projectUrl = 'https://wokwi.com/projects/462265376283578369';

  const reloadSimulator = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118] space-y-4 font-mono">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#161d2b]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Wokwi ESP32 Hardware Simulator // Embedded Live Runner
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Project ID: 462265376283578369 • MicroPython Firmware • SSD1306 OLED & RF ADC
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={reloadSimulator}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#233147] bg-[#111722] text-slate-300 hover:text-white transition-colors"
            title="Reload embedded Wokwi container"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RELOAD</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#233147] bg-[#111722] text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Full Width' : 'Expand Height'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'COMPACT' : 'EXPAND'}</span>
          </button>

          <a
            href={projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded font-bold border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition-colors"
          >
            <span>OPEN IN WOKWI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Wokwi Iframe Container */}
      <div
        className={`relative w-full rounded border border-[#1b2333] bg-[#080b10] overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'h-[750px]' : 'h-[520px]'
        }`}
      >
        <iframe
          key={iframeKey}
          src={projectUrl}
          title="Wokwi ESP32 Anti-Camera Hardware Simulator"
          className="w-full h-full border-0"
          allow="cross-origin-isolated; fullscreen"
          loading="lazy"
        />
      </div>

      {/* Hardware GPIO Pinout Quick Reference Strip */}
      <div className="p-3 rounded bg-[#090c12] border border-[#17202e] text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-bold border-b border-[#141b26] pb-1.5">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
            ESP32 HARDWARE WIRING MAP
          </span>
          <span className="text-slate-400 text-[10px]">DIAGRAM CONFIG: VCC 3.3V / COMMON GND</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[10px]">
          <div className="p-1.5 rounded bg-[#101520] border border-[#1a2538]">
            <div className="text-slate-400">GPIO 34 (ADC1_CH6)</div>
            <div className="text-cyan-300 font-bold mt-0.5">Potentiometer (RF)</div>
          </div>
          <div className="p-1.5 rounded bg-[#101520] border border-[#1a2538]">
            <div className="text-slate-400">GPIO 33 (INPUT)</div>
            <div className="text-rose-400 font-bold mt-0.5">Camera Pushbutton</div>
          </div>
          <div className="p-1.5 rounded bg-[#101520] border border-[#1a2538]">
            <div className="text-slate-400">GPIO 25 (OUTPUT)</div>
            <div className="text-rose-400 font-bold mt-0.5">Red LED (High Risk)</div>
          </div>
          <div className="p-1.5 rounded bg-[#101520] border border-[#1a2538]">
            <div className="text-slate-400">GPIO 26 / 27 (OUTPUT)</div>
            <div className="text-amber-400 font-bold mt-0.5">Yellow & Green LEDs</div>
          </div>
          <div className="p-1.5 rounded bg-[#101520] border border-[#1a2538]">
            <div className="text-slate-400">GPIO 14 (OUTPUT)</div>
            <div className="text-rose-400 font-bold mt-0.5">Piezo Buzzer (2kHz)</div>
          </div>
          <div className="p-1.5 rounded bg-[#101520] border border-[#1a2538]">
            <div className="text-slate-400">GPIO 21 (SDA) / 22 (SCL)</div>
            <div className="text-cyan-300 font-bold mt-0.5">SSD1306 OLED (I2C)</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
          <Info className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <span>
            Click the green <strong>"Start the simulation"</strong> button inside Wokwi. Use the potentiometer dial to vary simulated RF electromagnetic intensity.
          </span>
        </div>
      </div>
    </div>
  );
};

export default WokwiEmbedSection;

