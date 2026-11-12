import React, { useState } from 'react';
import { Cpu, Zap, Radio, Layers } from 'lucide-react';
import WokwiEmbedSection from '../components/simulator/WokwiEmbedSection';
import HiddenCameraSandbox from '../components/simulator/HiddenCameraSandbox';

export const Simulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'both' | 'wokwi' | 'sandbox'>('both');

  return (
    <div className="space-y-4 font-mono">
      {/* Page Header */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold tracking-wider text-slate-100 uppercase">
              IoT Simulation & Threat Injection Lab // Hardware Testbed
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Embedded Wokwi ESP32 micro-simulation paired with live hidden camera attack injection
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded border border-[#233147] bg-[#090c12] text-xs">
          <button
            onClick={() => setActiveTab('both')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === 'both'
                ? 'bg-[#151f2e] text-cyan-300 font-bold border border-[#233147]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>DUAL VIEW</span>
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === 'sandbox'
                ? 'bg-[#151f2e] text-cyan-300 font-bold border border-[#233147]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ATTACK SANDBOX</span>
          </button>
          <button
            onClick={() => setActiveTab('wokwi')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              activeTab === 'wokwi'
                ? 'bg-[#151f2e] text-cyan-300 font-bold border border-[#233147]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>WOKWI SIMULATOR</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {(activeTab === 'both' || activeTab === 'sandbox') && (
          <HiddenCameraSandbox />
        )}

        {(activeTab === 'both' || activeTab === 'wokwi') && (
          <WokwiEmbedSection />
        )}
      </div>
    </div>
  );
};

export default Simulator;

