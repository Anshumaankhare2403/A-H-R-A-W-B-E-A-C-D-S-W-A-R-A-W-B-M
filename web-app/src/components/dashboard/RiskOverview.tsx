import React from 'react';
import { ShieldCheck, ShieldAlert, Wifi, Radio, AlertOctagon, Terminal } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';
import { getRiskConfig } from '../../utils/riskHelpers';
import { formatRelativeTime } from '../../utils/formatDate';
import type { Telemetry } from '../../types/telemetry';
import { cn } from '../../utils/cn';

interface RiskOverviewProps {
  telemetry?: Telemetry;
  deviceId: string;
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({ telemetry, deviceId }) => {
  const risk = telemetry?.riskLevel || 'SAFE';
  const config = getRiskConfig(risk);
  const rfValue = telemetry?.rfValue ?? 0;
  const isAnomaly = rfValue > 2000;
  const suspiciousNetworks = telemetry?.wifiNetworks?.filter((n) => n.suspicious) ?? [];
  const suspiciousCount = suspiciousNetworks.length;
  const buttonTriggered = Boolean(telemetry?.cameraButton);

  // Authoritative condition evaluation description
  const getConditionCode = () => {
    if (buttonTriggered) return 'COND-05 [MANUAL HARDWARE OVERRIDE: GPIO 33 ACTIVE]';
    if (isAnomaly && suspiciousCount > 0) return 'COND-04 [HIGH: DUAL VECTOR - RF ANOMALY + SUSPICIOUS SSID]';
    if (isAnomaly && suspiciousCount === 0) return 'COND-03 [MEDIUM: RF FIELD ANOMALY EXCEEDING THRESHOLD]';
    if (!isAnomaly && suspiciousCount > 0) return 'COND-02 [LOW: SUSPICIOUS WI-FI BEACON DETECTED]';
    return 'COND-01 [SAFE: ALL SENSOR VECTORS WITHIN NOMINAL BASELINE]';
  };

  return (
    <div className="p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118]">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[#161d2b]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase">
            Threat Evaluation Matrix // Active State
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>TARGET: <span className="text-cyan-300 font-semibold">{deviceId}</span></span>
          <span className="text-slate-400">•</span>
          <span>SYNC: <span className="text-slate-300">{formatRelativeTime(telemetry?.receivedAt)}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Authoritative Threat State */}
        <div className="lg:col-span-5 p-4 rounded border border-[#17202e] bg-[#090c12] flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Evaluated Risk Level
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded border flex items-center justify-center flex-shrink-0',
                  risk === 'HIGH' && 'border-rose-500/40 bg-rose-500/10 text-rose-400',
                  risk === 'MEDIUM' && 'border-amber-500/40 bg-amber-500/10 text-amber-400',
                  risk === 'LOW' && 'border-blue-500/40 bg-blue-500/10 text-blue-400',
                  risk === 'SAFE' && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                )}
              >
                {risk === 'HIGH' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : risk === 'MEDIUM' ? (
                  <AlertOctagon className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-bold tracking-tight text-white">
                    {risk} RISK
                  </span>
                  <RiskBadge level={risk} size="sm" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {config.description}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#131a26] text-[10px] font-mono text-cyan-300/80">
            {getConditionCode()}
          </div>
        </div>

        {/* Right Column: 3 Sensor Vector Readouts */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Vector 1: RF Sensor */}
          <div className="p-3 rounded border border-[#17202e] bg-[#090c12] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">RF ADC</span>
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-white">
                {rfValue}
              </div>
              <div className="text-[10px] font-mono mt-1">
                {isAnomaly ? (
                  <span className="text-rose-400 font-bold">ANOMALY (&gt;2000)</span>
                ) : (
                  <span className="text-emerald-400">NOMINAL (&le;2000)</span>
                )}
              </div>
            </div>
            <div className="w-full bg-[#131b26] h-1 rounded-full mt-3 overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', isAnomaly ? 'bg-rose-500' : 'bg-cyan-400')}
                style={{ width: `${Math.min(100, (rfValue / 4095) * 100)}%` }}
              />
            </div>
          </div>

          {/* Vector 2: Wi-Fi Reconnaissance */}
          <div className="p-3 rounded border border-[#17202e] bg-[#090c12] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">Wi-Fi Threat</span>
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-white">
                {suspiciousCount}
              </div>
              <div className="text-[10px] font-mono mt-1">
                {suspiciousCount > 0 ? (
                  <span className="text-amber-400 font-bold">{suspiciousCount} SUSPICIOUS</span>
                ) : (
                  <span className="text-slate-400">0 DETECTED</span>
                )}
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-2 truncate">
              Total Scan: {telemetry?.wifiNetworks?.length ?? 0} SSIDs
            </div>
          </div>

          {/* Vector 3: Hardware Camera Trigger */}
          <div className="p-3 rounded border border-[#17202e] bg-[#090c12] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider">GPIO 33 Button</span>
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xl font-mono font-bold text-white">
                {buttonTriggered ? 'TRIGGER' : 'IDLE'}
              </div>
              <div className="text-[10px] font-mono mt-1">
                {buttonTriggered ? (
                  <span className="text-rose-400 font-bold">MANUAL TRIP</span>
                ) : (
                  <span className="text-slate-400">MONITORING</span>
                )}
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              Physical Pin: GPIO 33
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskOverview;
