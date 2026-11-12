import React, { useState } from 'react';
import { Radio, RefreshCw, Cpu, Activity, ShieldAlert, Copy, Check } from 'lucide-react';
import useAppStore from '../store/appStore';
import { useDevices, useDeviceLatest } from '../hooks/useDevices';
import LiveRFGauge from '../components/monitoring/LiveRFGauge';
import SuspiciousNetworkList from '../components/monitoring/SuspiciousNetworkList';
import ManualAlertIndicator from '../components/monitoring/ManualAlertIndicator';
import RFChart from '../components/dashboard/RFChart';
import RiskBadge from '../components/common/RiskBadge';
import { getRiskConfig } from '../utils/riskHelpers';
import { formatDate } from '../utils/formatDate';

export const LiveMonitoring: React.FC = () => {
  const { selectedDeviceId, setSelectedDeviceId, latestTelemetry, telemetryStream } = useAppStore();
  const [copied, setCopied] = useState(false);

  const { data: devicesData } = useDevices();
  const { data: polledLatest, refetch: refetchLatest } = useDeviceLatest(selectedDeviceId);

  const devices = devicesData?.data || [];

  // Prefer real-time socket telemetry; fallback to polled latest
  const liveTelemetry = latestTelemetry[selectedDeviceId] || polledLatest?.data;
  const currentRisk = liveTelemetry?.riskLevel || 'SAFE';
  const riskConfig = getRiskConfig(currentRisk);

  const rfValue = liveTelemetry?.rfValue ?? 0;
  const isAnomaly = rfValue > 2000;
  const networks = liveTelemetry?.wifiNetworks || [];
  const manualButtonTriggered = Boolean(liveTelemetry?.cameraButton);

  const copyPayload = () => {
    if (!liveTelemetry) return;
    navigator.clipboard.writeText(JSON.stringify(liveTelemetry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Device Selector & Real-Time Sync Indicator */}
      <div className="p-3.5 sm:p-4 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded border border-[#233147] bg-[#111722] flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              Live Sensor Telemetry Monitor // Channel Analyzer
            </h2>
            <p className="text-[11px] font-mono text-slate-400">
              Bi-directional WebSocket streaming from Node.js backend
            </p>
          </div>
        </div>

        {/* Device Picker & Re-sync */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">TARGET NODE:</span>
          </div>

          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="px-2.5 py-1 text-xs font-mono font-bold rounded border border-[#243147] bg-[#090c12] text-cyan-300 focus:outline-none"
          >
            {devices.length === 0 ? (
              <option value="esp32_dev01">esp32_dev01 (Active)</option>
            ) : (
              devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.deviceId} [{d.status.toUpperCase()}]
                </option>
              ))
            )}
          </select>

          <button
            onClick={() => refetchLatest()}
            className="p-1.5 rounded border border-[#243147] text-slate-400 hover:text-slate-200 hover:bg-[#151c28] transition-colors"
            title="Poll latest from backend"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* High Risk Threat Alert Banner */}
      {currentRisk === 'HIGH' && (
        <div className="p-3.5 rounded-md border border-rose-500/80 bg-rose-950/30 text-rose-300 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-xs tracking-wider uppercase text-rose-300">
                CRITICAL SURVEILLANCE RISK DETECTED
              </div>
              <div className="text-[11px] text-rose-300/80 mt-0.5">
                {manualButtonTriggered
                  ? 'Manual push button (GPIO 33) camera detection interrupt latched.'
                  : 'Electromagnetic RF spike above 2000 ADC coupled with suspicious hidden camera Wi-Fi beacon.'}
              </div>
            </div>
          </div>
          <RiskBadge level="HIGH" size="md" />
        </div>
      )}

      {/* Primary Live Gauge & Threat Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Speedometer Gauge */}
        <LiveRFGauge
          value={rfValue}
          max={4095}
          threshold={2000}
        />

        {/* Live Threat State Card */}
        <div className="p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#161d2b]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Rule Engine Evaluation
              </span>
              <RiskBadge level={currentRisk} size="sm" />
            </div>
            <h3 className="text-xl font-mono font-bold text-white mb-1">
              {currentRisk} STATE
            </h3>
            <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
              {riskConfig.description}
            </p>
          </div>

          <div className="space-y-1.5 mt-4 pt-3 border-t border-[#161d2b] text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">RF Anomaly (&gt;2000):</span>
              <span className={`font-bold ${isAnomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isAnomaly ? 'TRUE [SPIKE]' : 'FALSE [NOMINAL]'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Flagged SSIDs:</span>
              <span className="font-bold text-slate-200">
                {networks.filter((n) => n.suspicious).length} DETECTED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">GPIO 33 Button:</span>
              <span className={`font-bold ${manualButtonTriggered ? 'text-rose-400' : 'text-slate-400'}`}>
                {manualButtonTriggered ? 'TRIGGERED' : 'IDLE'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#141b26]">
              <span>Last Packet:</span>
              <span className="text-slate-300">{formatDate(liveTelemetry?.receivedAt || liveTelemetry?.deviceTimestamp)}</span>
            </div>
          </div>
        </div>

        {/* Wi-Fi Beacon Inspection */}
        <SuspiciousNetworkList networks={networks} />
      </div>

      {/* Manual Button Hardware Indicator */}
      <ManualAlertIndicator triggered={manualButtonTriggered} />

      {/* Real-time RF Streaming Chart */}
      <RFChart
        data={telemetryStream}
        threshold={2000}
      />

      {/* Live JSON Payload Terminal Inspector */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#161d2b] text-[11px] font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>RAW MQTT INGESTION TERMINAL // TELEMETRY FRAME</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[10px]">
              TOPIC: anticamera/{selectedDeviceId}/telemetry
            </span>
            <button
              onClick={copyPayload}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#233147] bg-[#111722] text-slate-300 hover:text-white transition-colors"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>
        <pre className="p-3 rounded bg-[#07090e] font-mono text-xs overflow-x-auto text-emerald-400 border border-[#161d2b] leading-relaxed">
          {JSON.stringify(liveTelemetry || { status: 'STANDBY', message: 'Awaiting incoming MQTT publish frames...' }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LiveMonitoring;
