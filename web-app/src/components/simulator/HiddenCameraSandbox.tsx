import React, { useState } from 'react';
import { Zap, Radio, Wifi, Send, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';
import { api } from '../../services/api';
import useAppStore from '../../store/appStore';
import RiskBadge from '../common/RiskBadge';

interface PresetScenario {
  id: string;
  name: string;
  risk: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';
  rfValue: number;
  ssid: string;
  isSuspicious: boolean;
  button: boolean;
  description: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'safe',
    name: 'SAFE BASELINE',
    risk: 'SAFE',
    rfValue: 720,
    ssid: 'Home_WiFi_Mesh_5G',
    isSuspicious: false,
    button: false,
    description: 'Quiescent electromagnetic baseline; all surrounding SSIDs benign.'
  },
  {
    id: 'low',
    name: 'SUSPICIOUS BEACON (LOW)',
    risk: 'LOW',
    rfValue: 1100,
    ssid: 'spycam_stream_covert',
    isSuspicious: true,
    button: false,
    description: 'Suspicious surveillance SSID beacon identified, RF at baseline.'
  },
  {
    id: 'medium',
    name: 'RF ANOMALY SPIKE (MEDIUM)',
    risk: 'MEDIUM',
    rfValue: 2850,
    ssid: 'Corporate_Guest_WiFi',
    isSuspicious: false,
    button: false,
    description: 'Electromagnetic RF spike >2000 ADC cutoff; no flagged SSIDs.'
  },
  {
    id: 'high-dual',
    name: 'HIDDEN SPYCAM (HIGH)',
    risk: 'HIGH',
    rfValue: 3480,
    ssid: 'hidden_camera_hd_unit',
    isSuspicious: true,
    button: false,
    description: 'Combined electromagnetic radiation breach + covert camera Wi-Fi beacon!'
  },
  {
    id: 'high-button',
    name: 'PHYSICAL TRIP (GPIO 33)',
    risk: 'HIGH',
    rfValue: 890,
    ssid: 'Local_AP_Normal',
    isSuspicious: false,
    button: true,
    description: 'Operator pressed physical camera detection pushbutton (hardware interrupt override).'
  }
];

export const HiddenCameraSandbox: React.FC = () => {
  const { selectedDeviceId } = useAppStore();

  // Custom Threat Form State
  const [rfValue, setRfValue] = useState<number>(2750);
  const [cameraSsid, setCameraSsid] = useState<string>('spycam_unit_x');
  const [cameraButton, setCameraButton] = useState<boolean>(false);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [lastInjectionResult, setLastInjectionResult] = useState<{
    success: boolean;
    riskLevel?: string;
    alertCreated?: boolean;
    latencyMs?: number;
    timestamp: string;
  } | null>(null);

  // Electrical conversions for display
  const voltage = ((rfValue / 4095) * 3.3).toFixed(2);
  const estimatedDbm = Math.round((rfValue / 4095) * 70 - 90);
  const isRfAnomaly = rfValue > 2000;

  // Execute Threat Injection to Backend
  const handleInject = async (params?: {
    rf?: number;
    ssid?: string;
    suspicious?: boolean;
    button?: boolean;
  }) => {
    const targetRf = params?.rf ?? rfValue;
    const targetSsid = params?.ssid ?? cameraSsid;
    const targetButton = params?.button ?? cameraButton;

    // Check if SSID matches suspicious keywords
    const keywords = ['spycam', 'camera', 'hidden', 'surveillance', 'monitor'];
    const isSsidFlagged =
      params?.suspicious ??
      keywords.some((kw) => targetSsid.toLowerCase().includes(kw));

    setIsInjecting(true);
    const startTime = performance.now();

    try {
      const payload = {
        deviceId: selectedDeviceId || 'esp32_dev01',
        deviceTimestamp: new Date().toISOString(),
        rfValue: targetRf,
        wifiNetworks: [
          { ssid: 'Benign_Home_WiFi', suspicious: false },
          { ssid: targetSsid, suspicious: isSsidFlagged }
        ],
        cameraButton: targetButton
      };

      const res = await api.postTelemetry(payload);
      const elapsed = Math.round(performance.now() - startTime);

      const injectedData = (res.data as any)?.telemetry || res.data;

      setLastInjectionResult({
        success: true,
        riskLevel: injectedData?.riskLevel || 'UNKNOWN',
        alertCreated: injectedData?.alertCreated || injectedData?.riskLevel !== 'SAFE',
        latencyMs: elapsed,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      setLastInjectionResult({
        success: false,
        latencyMs: Math.round(performance.now() - startTime),
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsInjecting(false);
    }
  };

  const handleApplyPreset = (preset: PresetScenario) => {
    setRfValue(preset.rfValue);
    setCameraSsid(preset.ssid);
    setCameraButton(preset.button);
    handleInject({
      rf: preset.rfValue,
      ssid: preset.ssid,
      suspicious: preset.isSuspicious,
      button: preset.button
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118] space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#161d2b]">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Hidden Camera Threat Injection Sandbox // Attack Simulator
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Test the live backend risk analysis engine, WebSocket broadcasts, and dashboard instruments
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] text-slate-400">TARGET:</span>
          <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-[#101520] border border-[#1b2538]">
            {selectedDeviceId}
          </span>
        </div>
      </div>

      {/* 1-Click Quick Deploy Preset Scenarios */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          1-Click Preset Threat Scenarios (Instant Ingestion)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              disabled={isInjecting}
              className="p-2.5 rounded border border-[#1a2333] bg-[#090c12] hover:border-[#27354d] hover:bg-[#111723] transition-colors text-left flex flex-col justify-between group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <RiskBadge level={preset.risk} size="sm" />
                <span className="text-[10px] text-slate-400 group-hover:text-cyan-300">
                  DEPLOY →
                </span>
              </div>
              <div className="text-xs font-bold text-slate-200 truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                {preset.description}
              </div>
              <div className="mt-2 pt-1.5 border-t border-[#141b26] text-[9px] text-slate-400 flex justify-between">
                <span>RF: {preset.rfValue} ADC</span>
                <span>{preset.button ? 'BTN: TRIP' : 'BTN: IDLE'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Threat Configurator Form */}
      <div className="p-4 rounded border border-[#17202e] bg-[#090c12] space-y-4">
        <div className="flex items-center justify-between border-b border-[#141b26] pb-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>CUSTOM ATTACK VECTOR CONFIGURATOR</span>
          </div>
          <span className="text-[10px] text-slate-400">
            TRANSPORTS DIRECTLY VIA POST /api/telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 1. RF Signal Intensity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                RF ELECTROMAGNETIC (ADC)
              </span>
              <span
                className={`font-bold ${
                  isRfAnomaly ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {rfValue} ADC {isRfAnomaly ? '[ANOMALY]' : '[SAFE]'}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={4095}
              step={10}
              value={rfValue}
              onChange={(e) => setRfValue(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#17202e] rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (0.00V)</span>
              <span className="text-rose-400 font-bold">2000 (1.61V LIMIT)</span>
              <span>4095 (3.30V)</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 bg-[#080b10] p-1.5 rounded border border-[#161d2b]">
              <span>EQUIV. SENSOR VOLTAGE: <strong className="text-slate-200">{voltage} V</strong></span>
              <span>EST. POWER: <strong className="text-slate-200">{estimatedDbm} dBm</strong></span>
            </div>
          </div>

          {/* 2. Hidden Camera SSID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                SURVEILLANCE Wi-Fi SSID
              </span>
            </div>

            <input
              type="text"
              value={cameraSsid}
              onChange={(e) => setCameraSsid(e.target.value)}
              placeholder="e.g. spycam_living_room"
              className="w-full px-3 py-1.5 text-xs rounded border border-[#233147] bg-[#080b10] text-slate-200 font-bold focus:outline-none"
            />

            {/* Quick Keyword Suggestion Chips */}
            <div className="flex flex-wrap gap-1 text-[9px] pt-1">
              <span className="text-slate-400">CHIPS:</span>
              {['spycam_covert_01', 'hidden_camera_hd', 'surveillance_cam', 'safe_guest_wifi'].map(
                (chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCameraSsid(chip)}
                    className="px-1.5 py-0.5 rounded border border-[#1d273a] bg-[#101724] text-cyan-400 hover:text-white"
                  >
                    {chip}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 3. Physical Button Toggle & Action Button */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400">
                HARDWARE GPIO 33 PUSHBUTTON
              </span>
              <button
                type="button"
                onClick={() => setCameraButton(!cameraButton)}
                className={`w-full py-2 px-3 rounded border text-xs font-bold flex items-center justify-between transition-colors ${
                  cameraButton
                    ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                    : 'border-[#233147] bg-[#080b10] text-slate-400'
                }`}
              >
                <span>{cameraButton ? 'BUTTON PRESSED [TRIP]' : 'BUTTON RELEASED [IDLE]'}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    cameraButton ? 'bg-rose-500 animate-ping' : 'bg-slate-600'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => handleInject()}
              disabled={isInjecting}
              className="w-full py-2 px-4 rounded font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isInjecting ? 'INJECTING...' : 'INJECT THREAT INTO LIVE DASHBOARD'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Ingestion Result Feedback Strip */}
      {lastInjectionResult && (
        <div
          className={`p-3 rounded border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            lastInjectionResult.success
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
              : 'border-rose-500/40 bg-rose-950/20 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {lastInjectionResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <div>
              <span className="font-bold">
                {lastInjectionResult.success
                  ? 'THREAT VECTOR INGESTED SUCCESSFULLY'
                  : 'FAILED TO COMMUNICATE WITH BACKEND API'}
              </span>
              {lastInjectionResult.success && (
                <span className="text-[11px] text-slate-300 ml-2">
                  → Backend Evaluated:{' '}
                  <strong className="text-white">
                    {lastInjectionResult.riskLevel}
                  </strong>{' '}
                  | Alert Triggered:{' '}
                  <strong className="text-amber-300">
                    {lastInjectionResult.alertCreated ? 'YES' : 'NO'}
                  </strong>
                </span>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center gap-2">
            <span>LATENCY: {lastInjectionResult.latencyMs} ms</span>
            <span>•</span>
            <span>TIME: {lastInjectionResult.timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiddenCameraSandbox;
