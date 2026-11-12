import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Shield } from 'lucide-react';
import type { Telemetry } from '../../types/telemetry';
import { RISK_CONFIG } from '../../utils/riskHelpers';

interface RiskDistributionProps {
  telemetry: Telemetry[];
  className?: string;
}

export const RiskDistribution: React.FC<RiskDistributionProps> = ({ telemetry = [], className }) => {
  const counts = {
    SAFE: 0,
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0
  };

  telemetry.forEach((t) => {
    if (t.riskLevel && counts[t.riskLevel] !== undefined) {
      counts[t.riskLevel]++;
    } else {
      counts.SAFE++;
    }
  });

  const chartData = [
    { name: 'SAFE', value: counts.SAFE, color: RISK_CONFIG.SAFE.hex },
    { name: 'LOW', value: counts.LOW, color: RISK_CONFIG.LOW.hex },
    { name: 'MEDIUM', value: counts.MEDIUM, color: RISK_CONFIG.MEDIUM.hex },
    { name: 'HIGH', value: counts.HIGH, color: RISK_CONFIG.HIGH.hex }
  ];

  const totalDetections = telemetry.length;

  return (
    <div className={`p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col justify-between ${className || ''}`}>
      <div className="pb-3 border-b border-[#161d2b]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Threat Severity Distribution
          </h3>
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
          Dataset: {totalDetections} historical telemetry frames
        </p>
      </div>

      <div className="h-44 w-full my-2">
        {totalDetections === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-slate-400">
            [NO TELEMETRY RECORDED]
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={3}
                stroke="#0d1118"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const percent = totalDetections > 0 ? ((Number(data.value) / totalDetections) * 100).toFixed(1) : '0';
                    return (
                      <div className="p-2 rounded border border-[#27354d] bg-[#0b0e14] text-[11px] font-mono text-slate-200 shadow-md">
                        <div className="font-bold flex items-center gap-1.5" style={{ color: (data.payload as any).color }}>
                          <span>{data.name}:</span>
                          <span>{data.value} ({percent}%)</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Structured Technical Breakdown */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#161d2b]">
        {chartData.map((tier) => (
          <div key={tier.name} className="flex items-center justify-between p-1.5 rounded bg-[#090c12] border border-[#17202e] text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
              <span className="text-slate-300 font-semibold">{tier.name}</span>
            </div>
            <span className="text-slate-400">
              {tier.value} ({totalDetections > 0 ? Math.round((tier.value / totalDetections) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskDistribution;
