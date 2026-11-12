import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight } from 'lucide-react';
import type { Device } from '../../types/device';
import { RiskBadge } from '../common/RiskBadge';
import { formatRelativeTime } from '../../utils/formatDate';

interface DeviceOverviewProps {
  devices: Device[];
  className?: string;
}

export const DeviceOverview: React.FC<DeviceOverviewProps> = ({ devices = [], className }) => {
  return (
    <div className={`p-4 sm:p-5 rounded-md border border-[#1b2333] bg-[#0d1118] ${className || ''}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#161d2b]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Node Fleet Inventory
          </h3>
        </div>
        <Link
          to="/devices"
          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          INVENTORY TABLE <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#161d2b] text-slate-400 text-[10px] uppercase tracking-wider">
              <th className="pb-2.5 pl-2">Node ID</th>
              <th className="pb-2.5">Connection</th>
              <th className="pb-2.5">Risk State</th>
              <th className="pb-2.5">RF ADC</th>
              <th className="pb-2.5 pr-2 text-right">Heartbeat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#131b26] text-[11px]">
            {devices.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 font-mono">
                  [NO ESP32 HARDWARE NODES REGISTERED]
                </td>
              </tr>
            ) : (
              devices.slice(0, 5).map((device) => (
                <tr
                  key={device.deviceId}
                  className="hover:bg-[#111723] transition-colors"
                >
                  <td className="py-2.5 pl-2 font-bold text-slate-200">
                    <Link to={`/devices/${device.deviceId}`} className="text-cyan-400 hover:underline">
                      {device.deviceId}
                    </Link>
                  </td>
                  <td className="py-2.5">
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
                  <td className="py-2.5">
                    <RiskBadge level={device.latestRisk || 'SAFE'} size="sm" />
                  </td>
                  <td className="py-2.5 text-slate-300 font-bold">
                    {device.latestRfValue ?? '--'}
                  </td>
                  <td className="py-2.5 pr-2 text-right text-slate-400 text-[10px]">
                    {formatRelativeTime(device.lastSeen)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceOverview;
