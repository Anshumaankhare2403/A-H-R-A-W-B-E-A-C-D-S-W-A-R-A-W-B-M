import { Server } from 'socket.io';

let ioInstance = null;

export function initSocket(server, corsOrigin = '*') {
  ioInstance = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join device-specific room if requested
    socket.on('subscribe:device', (deviceId) => {
      if (deviceId) {
        socket.join(`device:${deviceId}`);
        console.log(`[Socket.IO] Client ${socket.id} subscribed to room device:${deviceId}`);
      }
    });

    socket.on('unsubscribe:device', (deviceId) => {
      if (deviceId) {
        socket.leave(`device:${deviceId}`);
        console.log(`[Socket.IO] Client ${socket.id} unsubscribed from room device:${deviceId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function broadcastTelemetry(telemetry) {
  if (!ioInstance) return;
  ioInstance.emit('device:telemetry', telemetry);
  if (telemetry?.deviceId) {
    ioInstance.to(`device:${telemetry.deviceId}`).emit('device:telemetry', telemetry);
  }
}

export function broadcastStatus(device) {
  if (!ioInstance) return;
  ioInstance.emit('device:status', device);
  if (device?.deviceId) {
    ioInstance.to(`device:${device.deviceId}`).emit('device:status', device);
  }
}

export function broadcastRiskChanged(payload) {
  if (!ioInstance) return;
  ioInstance.emit('risk:changed', payload);
  if (payload?.deviceId) {
    ioInstance.to(`device:${payload.deviceId}`).emit('risk:changed', payload);
  }
}

export function broadcastAlert(alert) {
  if (!ioInstance) return;
  ioInstance.emit('alert:new', alert);
  if (alert?.severity === 'HIGH') {
    ioInstance.emit('alert:high-risk', alert);
  }
  if (alert?.deviceId) {
    ioInstance.to(`device:${alert.deviceId}`).emit('alert:new', alert);
    if (alert?.severity === 'HIGH') {
      ioInstance.to(`device:${alert.deviceId}`).emit('alert:high-risk', alert);
    }
  }
}

export default {
  initSocket,
  getIO,
  broadcastTelemetry,
  broadcastStatus,
  broadcastRiskChanged,
  broadcastAlert
};

