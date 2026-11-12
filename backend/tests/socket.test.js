import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { io as ClientIO } from 'socket.io-client';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { initSocket } from '../src/sockets/socketHandler.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { processTelemetry } from '../src/services/telemetryService.js';
import Device from '../src/models/Device.js';
import Telemetry from '../src/models/Telemetry.js';
import Alert from '../src/models/Alert.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/anticamera_test_socket';
const SOCKET_PORT = 15555;

describe('Socket.IO Real-time Events Integration Tests', () => {
  let server;
  let clientSocket;

  before(async () => {
    await connectDatabase(TEST_DB_URI);
    const app = createApp();
    server = http.createServer(app);
    initSocket(server, '*');

    await new Promise((resolve) => {
      server.listen(SOCKET_PORT, () => resolve());
    });

    clientSocket = ClientIO(`http://127.0.0.1:${SOCKET_PORT}`, {
      transports: ['websocket'],
      forceNew: true
    });

    await new Promise((resolve) => {
      clientSocket.on('connect', () => resolve());
    });
  });

  after(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await Device.deleteMany({});
    await Telemetry.deleteMany({});
    await Alert.deleteMany({});
  });

  it('TST-020: should broadcast device:telemetry, risk:changed, and alert:high-risk on high risk payload', async () => {
    let telemetryReceived = null;
    let riskChangedReceived = null;
    let highRiskAlertReceived = null;

    clientSocket.on('device:telemetry', (data) => {
      telemetryReceived = data;
    });

    clientSocket.on('risk:changed', (data) => {
      riskChangedReceived = data;
    });

    clientSocket.on('alert:high-risk', (data) => {
      highRiskAlertReceived = data;
    });

    // Ingest High Risk Telemetry
    await processTelemetry({
      deviceId: 'socket_dev_01',
      rfValue: 3200,
      wifiNetworks: [{ ssid: 'spycam_5g', suspicious: true }],
      cameraButton: false
    });

    // Wait for WebSocket delivery
    await new Promise((res) => setTimeout(res, 500));

    assert.ok(telemetryReceived, 'device:telemetry event was broadcast');
    assert.equal(telemetryReceived.deviceId, 'socket_dev_01');
    assert.equal(telemetryReceived.riskLevel, 'HIGH');

    assert.ok(riskChangedReceived, 'risk:changed event was broadcast');
    assert.equal(riskChangedReceived.newRisk, 'HIGH');

    assert.ok(highRiskAlertReceived, 'alert:high-risk event was broadcast');
    assert.equal(highRiskAlertReceived.severity, 'HIGH');
  });
});

