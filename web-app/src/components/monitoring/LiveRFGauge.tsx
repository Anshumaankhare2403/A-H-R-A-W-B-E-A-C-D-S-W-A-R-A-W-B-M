import React from 'react';
import { Radio } from 'lucide-react';

interface LiveRFGaugeProps {
  value: number;
  max?: number;
  threshold?: number;
}

export const LiveRFGauge: React.FC<LiveRFGaugeProps> = ({
  value = 0,
  max = 4095,
  threshold = 2000
}) => {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = clampedValue / max;
  const isAnomaly = value > threshold;

  // Gauge geometry: 180 degree semi-circle
  // Angle: -90 deg (left, 0) to +90 deg (right, max)
  const angle = -90 + percentage * 180;

  // Electrical conversions
  const voltage = ((clampedValue / max) * 3.3).toFixed(2);
  const estimatedDbm = Math.round((clampedValue / max) * 70 - 90); // Approximate -90 dBm to -20 dBm

  // Generate tick marks (every 500 ADC)
  const ticks = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4095];

  return (
    <div className="flex flex-col items-center justify-between p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118]">
      {/* Instrument Header */}
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#161d2b]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            RF Analog Power Instrument // 12-Bit ADC
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          PIN: GPIO 34 (ADC1_CH6)
        </span>
      </div>

      {/* Speedometer Instrument Body */}
      <div className="relative w-64 h-36 flex items-end justify-center my-3 select-none">
        <svg viewBox="0 0 240 140" className="w-full h-full overflow-visible">
          <defs>
            {/* Safe arc gradient */}
            <linearGradient id="safeArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            {/* Anomaly arc gradient */}
            <linearGradient id="hazardArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Outer Ring */}
          <path
            d="M 25 125 A 95 95 0 0 1 215 125"
            fill="none"
            stroke="#141c2a"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Safe Zone Arc (0 to Threshold 2000) */}
          <path
            d="M 25 125 A 95 95 0 0 1 120 30"
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            opacity="0.6"
          />

          {/* Hazard Zone Arc (Threshold 2000 to 4095) */}
          <path
            d="M 120 30 A 95 95 0 0 1 215 125"
            fill="none"
            stroke="#ef4444"
            strokeWidth="6"
            opacity="0.8"
          />

          {/* Threshold Hazard Notch Indicator at top center */}
          <line
            x1="120"
            y1="22"
            x2="120"
            y2="38"
            stroke="#ef4444"
            strokeWidth="2.5"
          />
          <text
            x="120"
            y="17"
            fill="#ef4444"
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            2000 LIMIT
          </text>

          {/* Scale Ticks & Labels */}
          {ticks.map((t) => {
            const tAngle = (-90 + (t / max) * 180) * (Math.PI / 180);
            const r1 = 88;
            const r2 = 96;
            const rText = 76;
            const x1 = 120 + r1 * Math.sin(tAngle);
            const y1 = 125 - r1 * Math.cos(tAngle);
            const x2 = 120 + r2 * Math.sin(tAngle);
            const y2 = 125 - r2 * Math.cos(tAngle);
            const xt = 120 + rText * Math.sin(tAngle);
            const yt = 125 - rText * Math.cos(tAngle);

            return (
              <g key={t}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={t >= threshold ? '#f87171' : '#64748b'}
                  strokeWidth={t === 0 || t === threshold || t === 4095 ? '2' : '1'}
                />
                <text
                  x={xt}
                  y={yt + 2}
                  fill="#64748b"
                  fontSize="6"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {t === 4095 ? '4K' : t}
                </text>
              </g>
            );
          })}

          {/* Gauge Needle */}
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: '120px 125px',
              transition: 'transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            {/* Needle line */}
            <line
              x1="120"
              y1="125"
              x2="120"
              y2="35"
              stroke={isAnomaly ? '#ef4444' : '#38bdf8'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Needle counterbalance */}
            <line
              x1="120"
              y1="125"
              x2="120"
              y2="135"
              stroke="#64748b"
              strokeWidth="3"
            />
          </g>

          {/* Center Hub */}
          <circle cx="120" cy="125" r="7" fill="#0d1118" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="120" cy="125" r="3" fill="#38bdf8" />
        </svg>

        {/* Instantaneous Digital Readout */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-mono font-bold tracking-tight text-white">
            {value} <span className="text-xs font-normal text-slate-400">ADC</span>
          </div>
        </div>
      </div>

      {/* Electrical & Analytical Conversions Bar */}
      <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-[#161d2b] text-[10px] font-mono text-center">
        <div className="p-1.5 rounded bg-[#090c12] border border-[#17202e]">
          <div className="text-slate-400">VOLTAGE</div>
          <div className="font-bold text-slate-200 mt-0.5">{voltage} V</div>
        </div>
        <div className="p-1.5 rounded bg-[#090c12] border border-[#17202e]">
          <div className="text-slate-400">EST. POWER</div>
          <div className="font-bold text-slate-200 mt-0.5">{estimatedDbm} dBm</div>
        </div>
        <div className="p-1.5 rounded bg-[#090c12] border border-[#17202e]">
          <div className="text-slate-400">STATE</div>
          <div className={`font-bold mt-0.5 ${isAnomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isAnomaly ? 'TRIP' : 'NORMAL'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRFGauge;
