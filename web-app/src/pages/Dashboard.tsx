import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Wifi, AlertTriangle, ShieldCheck, Zap, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import { useTelemetry } from '../hooks/useTelemetry';
import { useAlerts } from '../hooks/useAlerts';
import useAppStore from '../store/appStore';
import StatCard from '../components/dashboard/StatCard';
import RiskOverview from '../components/dashboard/RiskOverview';
import RFChart from '../components/dashboard/RFChart';
import RiskDistribution from '../components/dashboard/RiskDistribution';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import DeviceOverview from '../components/dashboard/DeviceOverview';
import ErrorBanner from '../components/common/ErrorBanner';
import HiddenCameraSandbox from '../components/simulator/HiddenCameraSandbox';

export const Dashboard: React.FC = () => {
  const { selectedDeviceId, latestTelemetry, telemetryStream } = useAppStore();
  const [showAttackSandbox, setShowAttackSandbox] = useState<boolean>(false);

  // Queries
  const { data: devicesData, isLoading: loadingDevices, error: devicesError, refetch: refetchDevices } = useDevices();
  const { data: telemetryData, isLoading: loadingTelemetry } = useTelemetry({ limit: 50 });
  const { data: alertsData, isLoading: loadingAlerts } = useAlerts({ limit: 10 });

  const devices = devicesData?.data || [];
  const telemetryHistory = telemetryData?.data || [];
  const alerts = alertsData?.data || [];

  // Compute live statistics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length;
  const highRiskDetections = telemetryHistory.filter((t) => t.riskLevel === 'HIGH').length;

  // Active device telemetry from live socket or fallback to query
  const liveForSelected = latestTelemetry[selectedDeviceId];
  const primaryTelemetry = liveForSelected || telemetryHistory[0];

  // Combined chart data: history + real-time stream
  const activeChartData = telemetryStream.length > 0 ? telemetryStream : telemetryHistory.slice(0, 30).reverse();

  if (devicesError) {
    return (
      <div className="space-y-4">
        <ErrorBanner
          message={`API communication error: ${devicesError.message}`}
          onRetry={refetchDevices}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tactical Operations Header Strip */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
              Hybrid RF & Wi-Fi Anti-Camera Detection System
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
              BUILD 2026.11
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Authoritative Risk Analysis Engine • Real-Time Electromagnetic ADC Telemetry • 802.11 SSID Heuristics
          </p>
        </div>

        {/* Hardware Pinout Mapping Tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-[#080b10] border border-[#17202e] text-slate-300">
            RF: <span className="text-cyan-400">GPIO 34</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#080b10] border border-[#17202e] text-slate-300">
            BTN: <span className="text-cyan-400">GPIO 33</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#080b10] border border-[#17202e] text-slate-300">
            LEDS: <span className="text-cyan-400">25/26/27</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#080b10] border border-[#17202e] text-slate-300">
            OLED: <span className="text-cyan-400">I2C 21/22</span>
          </span>
        </div>
      </div>

      {/* 4 Technical KPI Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="HARDWARE NODES"
          code="INV-01"
          value={loadingDevices ? '...' : totalDevices}
          description="Provisioned ESP32 microcontrollers"
          icon={Cpu}
          variant="cyan"
          trend="FLEET: 100%"
        />
        <StatCard
          title="ACTIVE TELEMETRY"
          code="MQTT-02"
          value={loadingDevices ? '...' : onlineDevices}
          description="Ingesting via port 1883 (5s loop)"
          icon={Wifi}
          variant="emerald"
          trend="HEARTBEAT: OK"
        />
        <StatCard
          title="ACTIVE INCIDENTS"
          code="SEC-03"
          value={loadingAlerts ? '...' : activeAlerts}
          description="Unacknowledged threat entries"
          icon={AlertTriangle}
          variant="amber"
          trend="QUEUE"
        />
        <StatCard
          title="HIGH-THREAT TRIPS"
          code="RISK-04"
          value={loadingTelemetry ? '...' : highRiskDetections}
          description="Exceeded threshold or camera trigger"
          icon={ShieldCheck}
          variant="rose"
          trend="PRIORITY 1"
        />
      </div>

      {/* Simulation & Threat Testing Action Bar */}
      <div className="p-3 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200">THREAT TESTING & IOT SIMULATION:</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Inject covert hidden cameras or launch Wokwi ESP32 testbed</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAttackSandbox(!showAttackSandbox)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-colors ${
              showAttackSandbox
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-[#111722] text-slate-200 border border-[#233147] hover:bg-[#162030]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{showAttackSandbox ? 'HIDE ATTACK INJECTOR' : 'INJECT HIDDEN CAMERA'}</span>
            {showAttackSandbox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Link
            to="/simulator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-bold bg-[#111722] text-cyan-300 border border-[#233147] hover:bg-[#162030] hover:text-white transition-colors"
          >
            <span>WOKWI TESTBED</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Expandable Hidden Camera Attack Sandbox */}
      {showAttackSandbox && (
        <HiddenCameraSandbox />
      )}

      {/* Primary Threat Evaluation Matrix */}
      <RiskOverview
        telemetry={primaryTelemetry}
        deviceId={selectedDeviceId}
      />

      {/* Middle Row: Oscilloscope Stream & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RFChart
            data={activeChartData}
            threshold={2000}
          />
        </div>
        <div>
          <RiskDistribution
            telemetry={telemetryHistory}
          />
        </div>
      </div>

      {/* Bottom Row: Incident Queue & Hardware Node Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentAlerts
          alerts={alerts}
        />
        <DeviceOverview
          devices={devices}
        />
      </div>
    </div>
  );
};

export default Dashboard;
