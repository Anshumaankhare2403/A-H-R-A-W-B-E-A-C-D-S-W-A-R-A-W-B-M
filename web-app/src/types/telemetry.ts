import type { RiskLevel } from './device';

export interface WifiNetwork {
  ssid: string;
  suspicious: boolean;
}

export interface Telemetry {
  _id: string;
  deviceId: string;
  deviceTimestamp: string;
  receivedAt: string;
  rfValue: number;
  rfAnomaly: boolean;
  wifiNetworks: WifiNetwork[];
  suspiciousSSID: boolean;
  cameraButton: boolean;
  riskLevel: RiskLevel;
}
