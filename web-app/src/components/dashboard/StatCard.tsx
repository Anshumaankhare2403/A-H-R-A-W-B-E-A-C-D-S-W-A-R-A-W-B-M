import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose';
  code?: string;
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  variant = 'cyan',
  code = 'STAT',
  trend,
  className
}) => {
  const accentDot = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-500'
  }[variant];

  return (
    <div
      className={cn(
        'p-4 rounded-md border border-[#1b2333] bg-[#0d1118] hover:border-[#27344c] transition-colors flex flex-col justify-between group relative overflow-hidden',
        className
      )}
    >
      {/* Top Bar: Code, Title, and Icon */}
      <div className="flex items-center justify-between mb-3 text-slate-400">
        <div className="flex items-center gap-2">
          <span className={cn('w-1.5 h-1.5 rounded-full', accentDot)} />
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
            {code} // {title}
          </span>
        </div>
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
      </div>

      {/* Main Metric Value */}
      <div className="my-1">
        <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 tracking-tight">
          {value}
        </div>
      </div>

      {/* Footer: Contextual description & trend */}
      <div className="flex items-center justify-between pt-2 border-t border-[#151c2a] text-[11px] font-mono text-slate-400 mt-2">
        <span className="truncate">{description}</span>
        {trend && (
          <span className="text-slate-400 font-semibold flex-shrink-0 ml-2">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
