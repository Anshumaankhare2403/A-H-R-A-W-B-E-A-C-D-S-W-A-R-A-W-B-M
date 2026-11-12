import React, { useState } from 'react';
import { History, Download, Filter, RefreshCw } from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';
import { useDevices } from '../hooks/useDevices';
import RiskBadge from '../components/common/RiskBadge';
import { formatDate } from '../utils/formatDate';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';

export const DetectionHistory: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data: devicesData } = useDevices();
  const devices = devicesData?.data || [];

  const { data, isLoading, error, refetch } = useTelemetry({
    deviceId: selectedDevice || undefined,
    riskLevel: riskFilter || undefined,
    page,
    limit
  });

  const records = data?.data || [];
  const pagination = data?.pagination;

  // Export CSV of currently loaded records
  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = ['Record ID', 'Device ID', 'RF Value', 'RF Anomaly', 'Suspicious SSID', 'Camera Button', 'Risk Level', 'Received At'];
    const rows = records.map((r) => [
      r._id,
      r.deviceId,
      r.rfValue,
      r.rfAnomaly ? 'TRUE' : 'FALSE',
      r.suspiciousSSID ? 'TRUE' : 'FALSE',
      r.cameraButton ? 'TRUE' : 'FALSE',
      r.riskLevel,
      r.receivedAt
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `anti_camera_telemetry_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header & Export Action */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              Telemetry Audit History // Chrono-Log
            </h2>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Complete historical register of all RF electromagnetic and Wi-Fi security evaluations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded border border-[#233147] bg-[#111722] text-slate-300 hover:text-white transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-bold border border-[#233147] bg-[#111722] text-cyan-300 hover:text-white hover:bg-[#162030] disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col md:flex-row gap-2.5 items-center justify-between font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
            <Filter className="w-3.5 h-3.5" />
            <span>NODE:</span>
          </div>
          <select
            value={selectedDevice}
            onChange={(e) => {
              setSelectedDevice(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 text-xs rounded border border-[#233147] bg-[#090c12] text-slate-200 focus:outline-none"
          >
            <option value="">ALL SENSOR NODES</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.deviceId}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] ml-2">
            <span>RISK:</span>
          </div>
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 text-xs rounded border border-[#233147] bg-[#090c12] text-slate-200 focus:outline-none"
          >
            <option value="">ALL RISK TIERS</option>
            <option value="SAFE">SAFE BASELINE</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH THREAT</option>
          </select>
        </div>

        <div className="text-[10px] text-slate-400">
          LOG ENTRIES: <span className="text-cyan-300 font-bold">{pagination?.total ?? records.length}</span>
        </div>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={refetch} />}

      {/* Telemetry Table */}
      <div className="rounded-md border border-[#1b2333] bg-[#0d1118] overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <LoadingSkeleton className="h-10 w-full" count={8} />
          </div>
        ) : records.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={History}
              title="No Historical Frames"
              description="No historical telemetry entries match the specified filter criteria."
              actionText="Reset Filters"
              onAction={() => {
                setSelectedDevice('');
                setRiskFilter('');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#161d2b] bg-[#090c12] text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5 pl-4">Timestamp (UTC/Local)</th>
                  <th className="py-2.5 px-3">Node ID</th>
                  <th className="py-2.5 px-3">RF ADC</th>
                  <th className="py-2.5 px-3">RF Anomaly</th>
                  <th className="py-2.5 px-3">Wi-Fi Beacons</th>
                  <th className="py-2.5 px-3">Camera Trip</th>
                  <th className="py-2.5 pr-4 text-right">Risk Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131b26] text-[11px]">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-[#111723] transition-colors">
                    <td className="py-2.5 pl-4 text-slate-300">
                      {formatDate(r.receivedAt || r.deviceTimestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-cyan-300">
                      {r.deviceId}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-100">
                      {r.rfValue} ADC
                    </td>
                    <td className="py-2.5 px-3">
                      {r.rfAnomaly ? (
                        <span className="text-rose-400 font-bold">TRUE (&gt;2000)</span>
                      ) : (
                        <span className="text-emerald-400">FALSE</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {r.wifiNetworks?.length || 0} SSIDs
                      {r.suspiciousSSID && (
                        <span className="ml-1 text-[10px] text-rose-400 font-bold">[FLAGGED]</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.cameraButton ? (
                        <span className="text-rose-400 font-bold">TRIP</span>
                      ) : (
                        <span className="text-slate-400">IDLE</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <RiskBadge level={r.riskLevel} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="p-3 rounded-md border border-[#1b2333] bg-[#0d1118] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            PAGE {pagination.page} OF {pagination.pages}
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

export default DetectionHistory;
