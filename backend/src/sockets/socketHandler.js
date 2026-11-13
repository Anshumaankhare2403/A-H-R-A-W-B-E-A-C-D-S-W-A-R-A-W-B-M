import { Server as SocketIOServer } from 'socket.io';
import config from '../config/environment.js';

let ioInstance = null;

export function initSocketIO(httpServer) {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('subscribe:device', (deviceId) => {
      if (deviceId) {
        socket.join(`device:${deviceId}`);
      }
    });

    socket.on('unsubscribe:device', (deviceId) => {
      if (deviceId) {
        socket.leave(`device:${deviceId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return ioInstance;
}

export function getSocketIO() {
  return ioInstance;
}

export function emitTelemetry(telemetryData) {
  if (!ioInstance) return;
  ioInstance.emit('device:telemetry', telemetryData);
  if (telemetryData.deviceId) {
    ioInstance.to(`device:${telemetryData.deviceId}`).emit('device:telemetry', telemetryData);
  }
}

export function emitDeviceStatus(deviceData) {
  if (!ioInstance) return;
  ioInstance.emit('device:status', deviceData);
  if (deviceData.deviceId) {
    ioInstance.to(`device:${deviceData.deviceId}`).emit('device:status', deviceData);
  }
}

export function emitRiskChanged(changeData) {
  if (!ioInstance) return;
  ioInstance.emit('risk:changed', changeData);
  if (changeData.deviceId) {
    ioInstance.to(`device:${changeData.deviceId}`).emit('risk:changed', changeData);
  }
}

export function emitAlert(alertData) {
  if (!ioInstance) return;
  ioInstance.emit('alert:new', alertData);
  if (alertData.severity === 'HIGH') {
    ioInstance.emit('alert:high-risk', alertData);
  }
}

export default {
  initSocketIO,
  getSocketIO,
  emitTelemetry,
  emitDeviceStatus,
  emitRiskChanged,
  emitAlert
};
