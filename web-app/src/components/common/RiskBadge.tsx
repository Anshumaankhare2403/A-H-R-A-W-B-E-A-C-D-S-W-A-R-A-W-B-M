import React from 'react';
import { getRiskConfig } from '../../utils/riskHelpers';
import { cn } from '../../utils/cn';

interface RiskBadgeProps {
  level?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level = 'SAFE',
  size = 'md',
  className,
  showDot = true
}) => {
  const config = getRiskConfig(level);

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1 font-bold'
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-mono font-bold uppercase tracking-wider border select-none',
        config.badgeBg,
        sizeClasses,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
          style={{ backgroundColor: config.hex }}
        />
      )}
      {config.label}
    </span>
  );
};

export default RiskBadge;
