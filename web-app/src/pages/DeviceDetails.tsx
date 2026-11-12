import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Radio, Shield, Clock, Activity, Terminal } from 'lucide-react';
import { useDevice } from '../hooks/useDevices';
import { useDeviceTelemetry } from '../hooks/useTelemetry';
import useAppStore from '../store/appStore';
import RiskBadge from '../components/common/RiskBadge';
import RFChart from '../components/dashboard/RFChart';
import { formatDate, formatRelativeTime } from '../utils/formatDate';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';

export const DeviceDetails: React.FC = () => {
  const { deviceId = '' } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const setSelectedDeviceId = useAppStore((s) => s.setSelectedDeviceId);

  const { data: deviceData, isLoading: loadingDevice, error: deviceError } = useDevice(deviceId);
  const { data: telemetryData } = useDeviceTelemetry(deviceId, { limit: 30 });

  const device = deviceData?.data;
  const history = telemetryData?.data || [];

  const handleMonitorLive = () => {
    setSelectedDeviceId(deviceId);
    navigate('/monitoring');
  };

  if (deviceError) {
    return (
      <div className="space-y-4">
        <Link to="/devices" className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Fleet Inventory
        </Link>
        <ErrorBanner message={`Device communication error: ${deviceError.message}`} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Live Action */}
      <div className="p-3.5 sm:p-4 rounded-md border border-[#1b2333] bg-[#0d1118] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/devices"
            className="p-1.5 rounded border border-[#233147] bg-[#111722] text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono font-bold tracking-tight text-slate-100">
                {deviceId}
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                NODE PROFILE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Microcontroller specifications, network state & telemetry audit history
            </p>
          </div>
        </div>

        <button
          onClick={handleMonitorLive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors self-start sm:self-auto"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>ROUTE TO LIVE OSCILLOSCOPE</span>
        </button>
      </div>

      {loadingDevice ? (
        <LoadingSkeleton className="h-32 w-full" />
      ) : device ? (
        /* Device Summary Card */
        <div className="p-4 rounded-md border border-[#1b2333] bg-[#0d1118] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-2.5 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" /> ALIAS NAME
            </span>
            <div className="font-bold text-slate-200 mt-1 truncate">
              {device.name}
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> LINK STATE
            </span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
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
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" /> LATEST RISK
            </span>
            <div className="mt-1">
              <RiskBadge level={device.latestRisk || 'SAFE'} size="sm" />
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#090c12] border border-[#17202e]">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> LAST CONTACT
            </span>
            <div className="font-bold text-slate-200 mt-1 truncate" title={formatDate(device.lastSeen)}>
              {formatRelativeTime(device.lastSeen)}
            </div>
          </div>
        </div>
      ) : null}

      {/* Historical RF Chart */}
      <RFChart
        data={history.slice().reverse()}
        threshold={2000}
      />

      {/* Historical Telemetry Table */}
      <div className="rounded-md border border-[#1b2333] bg-[#0d1118] overflow-hidden">
        <div className="p-3 border-b border-[#161d2b] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider text-slate-200">
              Audit Telemetry Log // Recent Transmissions
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            SHOWING LAST {history.length} FRAMES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#161d2b] bg-[#090c12] text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 pl-4">Timestamp</th>
                <th className="py-2.5 px-3">RF ADC</th>
                <th className="py-2.5 px-3">Wi-Fi Networks</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 pr-4 text-right">Camera Button</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131b26] text-[11px]">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    [NO TELEMETRY RECORDED FOR THIS SENSOR NODE]
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id} className="hover:bg-[#111723] transition-colors">
                    <td className="py-2.5 pl-4 text-slate-300">
                      {formatDate(record.receivedAt || record.deviceTimestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-100">
                      {record.rfValue} ADC
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {record.wifiNetworks?.length || 0} SSIDs
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={record.riskLevel} size="sm" />
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      {record.cameraButton ? (
                        <span className="text-rose-400 font-bold">TRIGGERED</span>
                      ) : (
                        <span className="text-slate-400">IDLE</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;
