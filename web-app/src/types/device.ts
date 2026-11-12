export type DeviceStatus = 'online' | 'offline' | 'warning' | 'error';
export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface Device {
  _id: string;
  deviceId: string;
  name: string;
  status: DeviceStatus;
  lastSeen: string;
  latestRisk: RiskLevel;
  latestRfValue: number;
  createdAt?: string;
  updatedAt?: string;
}

