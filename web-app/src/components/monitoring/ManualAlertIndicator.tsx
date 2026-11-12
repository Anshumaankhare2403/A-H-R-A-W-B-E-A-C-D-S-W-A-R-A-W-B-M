import React from 'react';
import { AlertOctagon, CheckCircle2, Terminal } from 'lucide-react';

interface ManualAlertIndicatorProps {
  triggered: boolean;
}

export const ManualAlertIndicator: React.FC<ManualAlertIndicatorProps> = ({ triggered }) => {
  return (
    <div
      className={`p-3.5 rounded-md border flex items-center justify-between font-mono transition-colors ${
        triggered
          ? 'border-rose-500/80 bg-rose-950/30 text-rose-300'
          : 'border-[#1b2333] bg-[#0d1118] text-slate-400'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 ${
            triggered
              ? 'border-rose-500 bg-rose-500/20 text-rose-400'
              : 'border-[#1b2333] bg-[#090c12] text-slate-400'
          }`}
        >
          {triggered ? <AlertOctagon className="w-4 h-4 animate-bounce" /> : <Terminal className="w-4 h-4" />}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Hardware GPIO Interrupt Line // Pin 33
          </div>
          <div className="text-xs font-bold text-slate-100">
            {triggered ? (
              <span className="text-rose-400 font-bold">PHYSICAL BUTTON DEPRESSED [OVERRIDE HIGH-RISK]</span>
            ) : (
              'INTERRUPT LINE QUIESCENT [PULL-UP IDLE]'
            )}
          </div>
        </div>
      </div>

      <div className="text-[11px] font-bold">
        {triggered ? (
          <span className="px-2 py-0.5 rounded border border-rose-500/60 bg-rose-500/20 text-rose-300">
            PULL-DOWN ACTIVE
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> IDLE (3.3V)
          </span>
        )}
      </div>
    </div>
  );
};

export default ManualAlertIndicator;
