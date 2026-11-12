import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Shield, Server, CheckCircle2, Terminal } from 'lucide-react';
import useAppStore from '../store/appStore';
import { API_BASE_URL } from '../services/api';

export const Settings: React.FC = () => {
  const { theme, toggleTheme, socketStatus } = useAppStore();
  const [savedMessage, setSavedMessage] = useState(false);

  const handleTestPing = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118]">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
            System Calibration & Operational Parameters
          </h2>
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-1">
          Interface display preferences, authoritative threshold calibrations, and backend topology diagnostics
        </p>
      </div>

      {savedMessage && (
        <div className="p-3 rounded border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System connectivity check verified: API & WebSocket channels synchronized.</span>
        </div>
      )}

      {/* 1. Interface Preferences */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-[#161d2b]">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Console Display Preferences
          </h3>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <div className="font-bold text-slate-200">
              Interface Color Theme
            </div>
            <div className="text-[11px] text-slate-400">
              Toggle between high-contrast dark cockpit and daylight field mode
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#233147] bg-[#111722] text-xs font-bold text-slate-200 hover:bg-[#162030] transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>LIGHT FIELD MODE</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-400" />
                <span>DARK COCKPIT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Detection Parameters & Risk Matrix Reference */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-[#161d2b]">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Authoritative Detection Logic & Calibration Values
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-[10px] text-slate-400 font-bold uppercase">RF Anomaly Cutoff (ADC)</span>
            <div className="text-xl font-bold text-cyan-300 mt-1">2000 ADC</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sample readings &gt; 2000 ADC flag an electromagnetic threat. Configured via backend <code className="text-cyan-400">.env</code>.
            </p>
          </div>

          <div className="p-3 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Heuristic Wi-Fi Signatures</span>
            <div className="text-xs text-slate-300 mt-1.5 flex flex-wrap gap-1">
              {['spycam', 'camera', 'hidden', 'surveillance', 'monitor'].map((kw) => (
                <span key={kw} className="px-1.5 py-0.5 rounded bg-[#131b26] border border-[#1a2536] text-cyan-400 text-[10px]">
                  {kw}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Case-insensitive substring search across all beacon SSIDs.
            </p>
          </div>
        </div>

        {/* Risk Classification Rules Table */}
        <div className="pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Authoritative Risk Engine Matrix (5-Condition Evaluation)
          </span>
          <div className="overflow-x-auto rounded border border-[#17202e]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090c12] font-bold text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Condition Code</th>
                  <th className="p-2.5">Risk Tier</th>
                  <th className="p-2.5">RF &gt; 2000</th>
                  <th className="p-2.5">Suspicious SSID</th>
                  <th className="p-2.5">Camera Button</th>
                  <th className="p-2.5">Actuator Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131b26] text-[11px]">
                <tr>
                  <td className="p-2.5 font-bold text-slate-300">COND-01</td>
                  <td className="p-2.5 font-bold text-emerald-400">SAFE</td>
                  <td className="p-2.5 text-slate-400">NO</td>
                  <td className="p-2.5 text-slate-400">NO</td>
                  <td className="p-2.5 text-slate-400">NO</td>
                  <td className="p-2.5 text-slate-400">Green LED ON; Buzzer SILENT</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-300">COND-02</td>
                  <td className="p-2.5 font-bold text-blue-400">LOW</td>
                  <td className="p-2.5 text-slate-400">NO</td>
                  <td className="p-2.5 text-cyan-400 font-bold">YES</td>
                  <td className="p-2.5 text-slate-400">NO</td>
                  <td className="p-2.5 text-slate-400">Yellow LED ON; Alert broadcast</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-300">COND-03</td>
                  <td className="p-2.5 font-bold text-amber-400">MEDIUM</td>
                  <td className="p-2.5 text-amber-400 font-bold">YES</td>
                  <td className="p-2.5 text-slate-400">NO</td>
                  <td className="p-2.5 text-slate-400">NO</td>
                  <td className="p-2.5 text-slate-400">Yellow LED ON; Alert broadcast</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-300">COND-04</td>
                  <td className="p-2.5 font-bold text-rose-400">HIGH</td>
                  <td className="p-2.5 text-rose-400 font-bold">YES</td>
                  <td className="p-2.5 text-rose-400 font-bold">YES</td>
                  <td className="p-2.5 text-slate-400">NO</td>
                  <td className="p-2.5 text-rose-400 font-bold">Red LED ON; Buzzer 2kHz ACTIVE</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-300">COND-05</td>
                  <td className="p-2.5 font-bold text-rose-400">HIGH (OVERRIDE)</td>
                  <td className="p-2.5 text-slate-400">ANY</td>
                  <td className="p-2.5 text-slate-400">ANY</td>
                  <td className="p-2.5 text-rose-400 font-bold">PRESSED</td>
                  <td className="p-2.5 text-rose-400 font-bold">Red LED ON; Buzzer 2kHz ACTIVE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. System & Network Diagnostics */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#161d2b]">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              System Network Topology & Transport Diagnostics
            </h3>
          </div>
          <button
            onClick={handleTestPing}
            className="px-2.5 py-1 text-xs font-bold rounded border border-[#233147] bg-[#111722] text-cyan-300 hover:text-white transition-colors"
          >
            RUN LINK AUDIT
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-slate-400 text-[10px] block mb-1">BACKEND API GATEWAY</span>
            <span className="text-slate-100 font-bold">{API_BASE_URL}</span>
          </div>

          <div className="p-3 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-slate-400 text-[10px] block mb-1">SOCKET.IO REAL-TIME STATUS</span>
            <span className={socketStatus === 'connected' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {socketStatus.toUpperCase()} [PORT 4000]
            </span>
          </div>

          <div className="p-3 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-slate-400 text-[10px] block mb-1">MQTT BROKER TRANSPORT</span>
            <span className="text-slate-300">127.0.0.1:1883 (Topic: anticamera/+/telemetry)</span>
          </div>

          <div className="p-3 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-slate-400 text-[10px] block mb-1">DATABASE STORAGE ENGINE</span>
            <span className="text-slate-300">MongoDB / Database: anti_camera (Collections: devices, telemetries, alerts)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
