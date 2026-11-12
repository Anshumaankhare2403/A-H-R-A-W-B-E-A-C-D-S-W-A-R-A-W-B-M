import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Search, Filter, RefreshCw, ExternalLink } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import { RiskBadge } from '../components/common/RiskBadge';
import { formatRelativeTime, formatDate } from '../utils/formatDate';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';

export const Devices: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useDevices({
    page,
    limit: 10,
    status: statusFilter || undefined,
    risk: riskFilter || undefined
  });

  const devices = data?.data || [];
  const pagination = data?.pagination;

  // Filter client-side search query
  const filteredDevices = devices.filter((d) => {
    return (
      d.deviceId.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              Sensor Node Inventory // Hardware Fleet
            </h2>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Registered ESP32 edge microcontrollers streaming telemetry over MQTT
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold bg-[#111722] border border-[#233147] text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RE-SCAN FLEET</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col md:flex-row gap-2.5 font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Node ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-[#233147] bg-[#090c12] text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded border border-[#233147] bg-[#090c12] text-slate-200 focus:outline-none"
          >
            <option value="">ALL STATUSES</option>
            <option value="online">ONLINE</option>
            <option value="offline">OFFLINE</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded border border-[#233147] bg-[#090c12] text-slate-200 focus:outline-none"
          >
            <option value="">ALL RISKS</option>
            <option value="SAFE">SAFE</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={refetch} />}

      {/* Devices Inventory Table */}
      <div className="rounded-md border border-[#1b2333] bg-[#0d1118] overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <LoadingSkeleton className="h-10 w-full" count={5} />
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Cpu}
              title="No Hardware Nodes Found"
              description="No registered ESP32 nodes matched the current search query or filter selection."
              actionText="Reset Filter"
              onAction={() => {
                setSearch('');
                setStatusFilter('');
                setRiskFilter('');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#161d2b] bg-[#090c12] text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 pl-4">Node Identifier</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                  <th className="py-2.5 px-3">RF ADC</th>
                  <th className="py-2.5 px-3">Firmware</th>
                  <th className="py-2.5 px-3">Heartbeat</th>
                  <th className="py-2.5 pr-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131b26] text-[11px]">
                {filteredDevices.map((device) => (
                  <tr
                    key={device.deviceId}
                    className="hover:bg-[#111723] transition-colors"
                  >
                    <td className="py-3 pl-4">
                      <div className="font-bold text-slate-100">{device.deviceId}</div>
                      <div className="text-[10px] text-slate-400">{device.name}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          device.status === 'online'
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            device.status === 'online' ? 'bg-emerald-400' : 'bg-rose-500'
                          }`}
                        />
                        {device.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <RiskBadge level={device.latestRisk || 'SAFE'} size="sm" />
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-200">
                      {device.latestRfValue !== undefined ? `${device.latestRfValue} ADC` : '--'}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      v1.0.0-wokwi
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[10px]" title={formatDate(device.lastSeen)}>
                      {formatRelativeTime(device.lastSeen)}
                    </td>

                    <td className="py-3 pr-4 text-right">
                      <Link
                        to={`/devices/${device.deviceId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#233147] bg-[#111722] text-cyan-300 hover:text-white transition-colors"
                      >
                        <span>VIEW</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
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
            PAGE {pagination.page} OF {pagination.pages} ({pagination.total} TOTAL NODES)
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

export default Devices;
