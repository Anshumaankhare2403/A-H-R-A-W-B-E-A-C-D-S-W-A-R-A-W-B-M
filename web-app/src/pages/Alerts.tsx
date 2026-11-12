import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, RefreshCw, Filter, Clock, Radio, Wifi, Shield } from 'lucide-react';
import { useAlerts, useAcknowledgeAlert } from '../hooks/useAlerts';
import RiskBadge from '../components/common/RiskBadge';
import { formatDate, formatRelativeTime } from '../utils/formatDate';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';

export const Alerts: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState('');
  const [ackFilter, setAckFilter] = useState('');
  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAlerts({
    severity: severityFilter || undefined,
    acknowledged: ackFilter === '' ? undefined : ackFilter === 'true',
    page,
    limit: 15
  });

  const acknowledgeMutation = useAcknowledgeAlert();
  const alerts = data?.data || [];
  const pagination = data?.pagination;

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(alertId);
      setSuccessMessage(`Incident ${alertId.slice(-6).toUpperCase()} acknowledged.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to acknowledge alert: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              Security Operations Center // Incident Triage Queue
            </h2>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Authoritative threat events flagged by the hybrid RF & Wi-Fi risk analysis engine
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold bg-[#111722] border border-[#233147] text-slate-300 hover:text-white hover:bg-[#161f2e] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RE-SYNC QUEUE</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 rounded border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-3 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col sm:flex-row gap-2.5 items-center justify-between font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Filter className="w-3.5 h-3.5" />
            <span>FILTER:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 text-xs rounded border border-[#233147] bg-[#090c12] text-slate-200 focus:outline-none"
          >
            <option value="">ALL SEVERITIES</option>
            <option value="HIGH">CRITICAL [HIGH]</option>
            <option value="MEDIUM">WARNING [MEDIUM]</option>
            <option value="LOW">INFORMATIONAL [LOW]</option>
          </select>

          <select
            value={ackFilter}
            onChange={(e) => {
              setAckFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 text-xs rounded border border-[#233147] bg-[#090c12] text-slate-200 focus:outline-none"
          >
            <option value="">ALL STATUSES</option>
            <option value="false">UNACKNOWLEDGED</option>
            <option value="true">ACKNOWLEDGED</option>
          </select>
        </div>

        <div className="text-[10px] text-slate-400">
          TOTAL MATCHES: <span className="text-cyan-300 font-bold">{pagination?.total ?? alerts.length}</span>
        </div>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={refetch} />}

      {/* Incident List */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-20 w-full" count={4} />
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Incident Queue Quiescent"
          description="Zero security threats match the specified triage filter parameters."
          actionText="Reset Filters"
          onAction={() => {
            setSeverityFilter('');
            setAckFilter('');
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-3.5 rounded-md border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono ${
                !alert.acknowledged
                  ? alert.severity === 'HIGH'
                    ? 'border-rose-500/60 bg-rose-950/20'
                    : 'border-amber-500/40 bg-amber-950/20'
                  : 'border-[#17202e] bg-[#090c12]'
              }`}
            >
              {/* Left Column: Metadata */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={alert.severity} size="sm" />
                  <span className="text-xs font-bold text-cyan-300 bg-[#101724] px-2 py-0.5 rounded border border-[#1d293d]">
                    {alert.deviceId}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ID: {alert._id.slice(-8).toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      alert.acknowledged
                        ? 'border-[#222c3d] text-slate-400 bg-[#0d121a]'
                        : 'border-rose-500/40 text-rose-400 bg-rose-950/40'
                    }`}
                  >
                    {alert.acknowledged ? 'TRIAGED' : 'OPEN ACTION'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-sans font-medium">
                  {alert.message}
                </p>

                {/* Technical Sensor Tags */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                  <div className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-cyan-400" />
                    <span>RF: <span className="text-slate-200 font-bold">{alert.rfValue || 0} ADC</span></span>
                  </div>

                  {alert.suspiciousSSIDs && alert.suspiciousSSIDs.length > 0 && (
                    <div className="flex items-center gap-1 text-rose-400">
                      <Wifi className="w-3 h-3" />
                      <span>BEACON: {alert.suspiciousSSIDs.join(', ')}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span title={formatDate(alert.occurredAt)}>{formatRelativeTime(alert.occurredAt)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Action Button */}
              <div className="flex-shrink-0 self-end md:self-center">
                {!alert.acknowledged ? (
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    disabled={acknowledgeMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACKNOWLEDGE</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-[#0b1913] px-2.5 py-1 rounded border border-[#113d29]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>RESOLVED</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="p-3 rounded-md border border-[#1b2333] bg-[#0d1118] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            PAGE {pagination.page} OF {pagination.pages} ({pagination.total} INCIDENTS)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-2.5 py-1 rounded border border-[#233147] disabled:opacity-30 hover:bg-[#151c28]"
            >
              PREVIOUS
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded border border-[#233147] disabled:opacity-30 hover:bg-[#151c28]"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
