import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { BarChart3, ShieldAlert, Radio } from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';
import { useAlerts } from '../hooks/useAlerts';
import { useDevices } from '../hooks/useDevices';
import { RISK_CONFIG } from '../utils/riskHelpers';
import { formatTimeOnly } from '../utils/formatDate';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');

  const { data: telemetryData } = useTelemetry({ limit: 100 });
  const { data: alertsData } = useAlerts({ limit: 50 });
  const { data: devicesData } = useDevices();

  const telemetry = telemetryData?.data || [];
  const alerts = alertsData?.data || [];
  const devices = devicesData?.data || [];

  // 1. Severity Distribution
  const alertCounts = {
    HIGH: alerts.filter((a) => a.severity === 'HIGH').length,
    MEDIUM: alerts.filter((a) => a.severity === 'MEDIUM').length,
    LOW: alerts.filter((a) => a.severity === 'LOW').length
  };

  const alertChartData = [
    { severity: 'HIGH', count: alertCounts.HIGH, color: RISK_CONFIG.HIGH.hex },
    { severity: 'MEDIUM', count: alertCounts.MEDIUM, color: RISK_CONFIG.MEDIUM.hex },
    { severity: 'LOW', count: alertCounts.LOW, color: RISK_CONFIG.LOW.hex }
  ];

  // 2. RF Signal Trend Series
  const rfTrendData = telemetry
    .slice(0, 30)
    .reverse()
    .map((t) => ({
      time: formatTimeOnly(t.receivedAt || t.deviceTimestamp),
      rfValue: t.rfValue
    }));

  const rfValues = telemetry.map((t) => t.rfValue);
  const avgRf = rfValues.length > 0 ? Math.round(rfValues.reduce((a, b) => a + b, 0) / rfValues.length) : 0;
  const maxRf = rfValues.length > 0 ? Math.max(...rfValues) : 0;

  return (
    <div className="space-y-4">
      {/* Header & Date Range Filter */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              Signal Analytics & Threat Recurrence // Statistical Spectra
            </h2>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Chronological RF electromagnetic variance, threat recurrence histogram, and sensor telemetry analysis
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded border border-[#233147] bg-[#090c12] self-start sm:self-auto font-mono text-xs">
          {(['24h', '7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeRange === range
                  ? 'bg-[#151f2e] text-cyan-300 font-bold border border-[#233147]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            MEAN RF BASELINE
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">
            {avgRf} <span className="text-xs text-slate-400 font-normal">ADC</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Calculated across {telemetry.length} data points
          </div>
        </div>

        <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            PEAK DETECTED EMISSION
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            {maxRf} <span className="text-xs text-slate-400 font-normal">ADC</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Critical threshold set at 2000 ADC
          </div>
        </div>

        <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            FLEET INGESTION INTEGRITY
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            100% <span className="text-xs text-slate-400 font-normal">QoS 0</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {devices.length} registered hardware nodes active
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RF Signal Chrono Variance */}
        <div className="p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118]">
          <div className="pb-3 mb-3 border-b border-[#161d2b]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                RF Electromagnetic Variance Over Time
              </h3>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Historical ADC trajectory across recent transmission intervals
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rfTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsRfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#161e2c" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 4095]}
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2 rounded border border-[#27354d] bg-[#0b0e14] text-[11px] font-mono text-slate-200">
                          <div>Time: {item.time}</div>
                          <div className="font-bold text-cyan-300">RF: {item.rfValue} ADC</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rfValue"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#analyticsRfGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Incident Recurrence Bar Chart */}
        <div className="p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118]">
          <div className="pb-3 mb-3 border-b border-[#161d2b]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Threat Incidents by Severity
              </h3>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Cumulative incident counts grouped by authoritative risk tier
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161e2c" vertical={false} />
                <XAxis
                  dataKey="severity"
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2 rounded border border-[#27354d] bg-[#0b0e14] text-[11px] font-mono text-slate-200">
                          <div>{item.severity} SEVERITY</div>
                          <div className="font-bold" style={{ color: item.color }}>
                            Incidents: {item.count}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {alertChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
