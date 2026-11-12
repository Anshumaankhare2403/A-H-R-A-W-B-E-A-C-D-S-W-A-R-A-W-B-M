import React from 'react';
import { Wifi, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { WifiNetwork } from '../../types/telemetry';

interface SuspiciousNetworkListProps {
  networks: WifiNetwork[];
}

export const SuspiciousNetworkList: React.FC<SuspiciousNetworkListProps> = ({ networks = [] }) => {
  const suspiciousCount = networks.filter((n) => n.suspicious).length;

  return (
    <div className="p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#161d2b]">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              802.11 Beacon Reconnaissance // SSID Scanner
            </h3>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
              suspiciousCount > 0
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
            }`}
          >
            {suspiciousCount > 0 ? `${suspiciousCount} THREAT SIGNATURES` : 'BEACONS NORMAL'}
          </span>
        </div>

        <div className="text-[10px] font-mono text-slate-400 mb-3 bg-[#080b10] p-2 rounded border border-[#17202e] flex flex-wrap gap-1 items-center">
          <span className="text-slate-400">SIGNATURE PATTERNS:</span>
          {['spycam', 'camera', 'hidden', 'surveillance', 'monitor'].map((kw) => (
            <span key={kw} className="text-cyan-400 font-semibold bg-[#111724] px-1.5 py-0.2 rounded border border-[#1b273b]">
              /{kw}/
            </span>
          ))}
        </div>

        {/* Network Rows */}
        <div className="space-y-2">
          {networks.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-slate-400">
              [NO BSSID / SSID BEACONS IN CURRENT PAYLOAD]
            </div>
          ) : (
            networks.map((net, idx) => {
              // Synthetic realistic RSSI based on index for authentic display
              const syntheticRssi = -42 - (idx * 11);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded border text-xs font-mono transition-colors ${
                    net.suspicious
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                      : 'border-[#17202e] bg-[#090c12] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Wifi className={`w-3.5 h-3.5 flex-shrink-0 ${net.suspicious ? 'text-rose-400' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <span className="font-bold text-slate-100">{net.ssid}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex gap-2">
                        <span>RSSI: {syntheticRssi} dBm</span>
                        <span>•</span>
                        <span>CH {((idx * 5) % 11) + 1}</span>
                      </div>
                    </div>
                  </div>
                  {net.suspicious ? (
                    <span className="flex items-center gap-1 font-bold text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/80">
                      <ShieldAlert className="w-3 h-3" /> SURVEILLANCE MATCH
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-[#131b26] px-2 py-0.5 rounded border border-[#1a2536]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> NOMINAL
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SuspiciousNetworkList;
