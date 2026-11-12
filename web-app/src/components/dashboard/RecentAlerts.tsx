import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import type { Alert } from '../../types/alert';
import { RiskBadge } from '../common/RiskBadge';
import { formatRelativeTime } from '../../utils/formatDate';

interface RecentAlertsProps {
  alerts: Alert[];
  className?: string;
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts = [], className }) => {
  return (
    <div className={`p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col justify-between ${className || ''}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#161d2b]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Active Incident Feed
          </h3>
        </div>
        <Link
          to="/alerts"
          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          FULL LOG <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto max-h-80">
        {alerts.length === 0 ? (
          <div className="py-10 text-center font-mono text-xs text-slate-400 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400/60" />
            <span>[NO UNRESOLVED INCIDENTS DETECTED]</span>
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div
              key={alert._id}
              className="p-3 rounded border border-[#17202e] bg-[#090c12] hover:border-[#27354d] transition-colors flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <RiskBadge level={alert.severity} size="sm" />
                  <span className="font-mono text-[11px] font-bold text-slate-200">
                    {alert.deviceId}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    RF: {alert.rfValue || 0}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate max-w-md font-mono">
                  {alert.message}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(alert.occurredAt)}</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                  alert.acknowledged
                    ? 'border-slate-800 text-slate-400 bg-slate-900'
                    : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                }`}
              >
                {alert.acknowledged ? 'ACKNOWLEDGED' : 'PENDING'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentAlerts;
