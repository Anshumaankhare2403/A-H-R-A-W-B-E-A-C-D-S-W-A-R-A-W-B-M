import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = ShieldAlert,
  title,
  description,
  actionText,
  onAction,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center rounded-md border border-dashed border-[#233147] bg-[#090c12] font-mono', className)}>
      <div className="w-10 h-10 rounded border border-[#233147] bg-[#111722] text-slate-400 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-[11px] text-slate-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-3 py-1.5 text-xs font-bold rounded border border-[#233147] bg-[#111722] text-cyan-300 hover:text-white hover:bg-[#162030] transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
