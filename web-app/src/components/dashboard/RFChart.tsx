import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Radio } from 'lucide-react';
import type { Telemetry } from '../../types/telemetry';
import { formatTimeOnly } from '../../utils/formatDate';

interface RFChartProps {
  data: Telemetry[];
  threshold?: number;
  className?: string;
}

export const RFChart: React.FC<RFChartProps> = ({
  data = [],
  threshold = 2000,
  className
}) => {
  const chartData = data.map((t) => ({
    time: formatTimeOnly(t.receivedAt || t.deviceTimestamp),
    rfValue: t.rfValue,
    anomaly: t.rfValue > threshold
  }));

  const rfValues = chartData.map((d) => d.rfValue);
  const currentVal = rfValues.length > 0 ? rfValues[rfValues.length - 1] : 0;
  const minVal = rfValues.length > 0 ? Math.min(...rfValues) : 0;
  const maxVal = rfValues.length > 0 ? Math.max(...rfValues) : 0;
  const avgVal = rfValues.length > 0 ? Math.round(rfValues.reduce((a, b) => a + b, 0) / rfValues.length) : 0;
  const isCurrentlyOver = currentVal > threshold;

  return (
    <div className={`p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118] ${className || ''}`}>
      {/* Instrument Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#161d2b]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              RF Sensor Oscilloscope // 12-Bit ADC Chrono-Spectrum
            </h3>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            ADC Pin: GPIO 34 • Range: 0-4095 • Rate: 0.20 Hz (5.0s loop)
          </p>
        </div>

        {/* Telemetry Metrics Readout Strip */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className="px-2.5 py-1 rounded bg-[#090c12] border border-[#17202e] text-slate-300">
            <span className="text-slate-400">MIN:</span> <span className="font-bold">{minVal}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#090c12] border border-[#17202e] text-slate-300">
            <span className="text-slate-400">AVG:</span> <span className="font-bold">{avgVal}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#090c12] border border-[#17202e] text-slate-300">
            <span className="text-slate-400">MAX:</span> <span className="font-bold text-amber-300">{maxVal}</span>
          </div>
          <div
            className={`px-2.5 py-1 rounded font-bold border ${
              isCurrentlyOver
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
            }`}
          >
            CURR: {currentVal}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-60 sm:h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-slate-400">
            [WAITING FOR TELEMETRY FRAMES...]
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rfTechnicalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isCurrentlyOver ? '#ef4444' : '#06b6d4'} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={isCurrentlyOver ? '#ef4444' : '#06b6d4'} stopOpacity={0.0} />
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
                ticks={[0, 1000, 2000, 3000, 4000]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded border border-[#27354d] bg-[#0b0e14] shadow-lg text-[11px] font-mono text-slate-200">
                        <div className="text-slate-400 mb-1">{item.time}</div>
                        <div className="flex justify-between gap-4">
                          <span>RF Signal:</span>
                          <span className={`font-bold ${item.anomaly ? 'text-rose-400' : 'text-cyan-300'}`}>
                            {item.rfValue} ADC
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-400 text-[10px]">
                          <span>Status:</span>
                          <span>{item.anomaly ? 'ANOMALY EXCEEDED' : 'NOMINAL BASELINE'}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Threshold Limit Line */}
              <ReferenceLine
                y={threshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `CRITICAL THRESHOLD: ${threshold}`,
                  fill: '#ef4444',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  position: 'insideTopRight'
                }}
              />
              <Area
                type="monotone"
                dataKey="rfValue"
                stroke={isCurrentlyOver ? '#ef4444' : '#06b6d4'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rfTechnicalGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RFChart;
