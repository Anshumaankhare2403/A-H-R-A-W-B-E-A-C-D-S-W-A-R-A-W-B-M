import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';
import type { Telemetry } from '../types/telemetry';
import type { Device } from '../types/device';
import type { Alert } from '../types/alert';

export type SocketStatus = 'connected' | 'connecting' | 'disconnected';

class SocketService {
  private socket: Socket | null = null;
  private statusListeners: Array<(status: SocketStatus) => void> = [];
  private currentStatus: SocketStatus = 'disconnected';

  public getStatus(): SocketStatus {
    return this.currentStatus;
  }

  public onStatusChange(callback: (status: SocketStatus) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  private setStatus(status: SocketStatus) {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.statusListeners.forEach((cb) => cb(status));
    }
  }

  public connect(): Socket {
    if (this.socket && (this.socket.connected || this.currentStatus === 'connecting')) {
      return this.socket;
    }

    this.setStatus('connecting');

    this.socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log(`[SocketService] Connected to backend at ${API_BASE_URL} (ID: ${this.socket?.id})`);
      this.setStatus('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`[SocketService] Disconnected from backend: ${reason}`);
      this.setStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error(`[SocketService] Connection error:`, error.message);
      this.setStatus('disconnected');
    });

    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.setStatus('disconnected');
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public subscribeDevice(deviceId: string) {
    if (this.socket?.connected && deviceId) {
      this.socket.emit('subscribe:device', deviceId);
    }
  }

  public unsubscribeDevice(deviceId: string) {
    if (this.socket?.connected && deviceId) {
      this.socket.emit('unsubscribe:device', deviceId);
    }
  }

  public onTelemetry(callback: (data: Telemetry) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('device:telemetry', callback);
    return () => {
      this.socket?.off('device:telemetry', callback);
    };
  }

  public onStatus(callback: (data: Device) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('device:status', callback);
    return () => {
      this.socket?.off('device:status', callback);
    };
  }

  public onRiskChanged(callback: (data: { deviceId: string; previousRisk: string; newRisk: string; rfValue: number }) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('risk:changed', callback);
    return () => {
      this.socket?.off('risk:changed', callback);
    };
  }

  public onAlert(callback: (data: Alert) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('alert:new', callback);
    return () => {
      this.socket?.off('alert:new', callback);
    };
  }

  public onHighRiskAlert(callback: (data: Alert) => void): () => void {
    if (!this.socket) this.connect();
    this.socket?.on('alert:high-risk', callback);
    return () => {
      this.socket?.off('alert:high-risk', callback);
    };
  }
}

export const socketService = new SocketService();
export default socketService;
