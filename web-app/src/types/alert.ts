export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Alert {
  _id: string;
  deviceId: string;
  severity: AlertSeverity;
  message: string;
  rfValue: number;
  suspiciousSSIDs: string[];
  acknowledged: boolean;
  occurredAt: string;
  createdAt?: string;
  updatedAt?: string;
}

