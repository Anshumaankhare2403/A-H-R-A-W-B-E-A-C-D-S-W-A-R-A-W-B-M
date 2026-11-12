import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, className }) => {
  return (
    <div className={cn('flex items-center justify-between p-3.5 rounded-md border border-rose-500/60 bg-rose-950/20 text-rose-300 font-mono text-xs', className)}>
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
        <span className="font-semibold">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>RETRY LINK</span>
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
