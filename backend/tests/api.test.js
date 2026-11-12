import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import Device from '../src/models/Device.js';
import Telemetry from '../src/models/Telemetry.js';
import Alert from '../src/models/Alert.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/anticamera_test_api';

describe('REST API Automated Tests', () => {
  let app;

  before(async () => {
    await connectDatabase(TEST_DB_URI);
    app = createApp();
  });

  after(async () => {
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

  it('TST-013: GET /api/health should return system status and dependency health', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.dependencies.database.status, 'connected');
    assert.equal(typeof res.body.uptime, 'number');
  });

  it('TST-014: GET /api/devices should list registered devices with pagination', async () => {
    await Device.create([
      { deviceId: 'dev_01', name: 'ESP32-1', status: 'online', latestRisk: 'SAFE', latestRfValue: 500 },
      { deviceId: 'dev_02', name: 'ESP32-2', status: 'online', latestRisk: 'HIGH', latestRfValue: 3200 }
    ]);

    const res = await request(app).get('/api/devices?page=1&limit=10');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.pagination.total, 2);
  });

  it('TST-015: GET /api/devices/:deviceId should return single device details', async () => {
    await Device.create({
      deviceId: 'dev_special',
      name: 'Custom-Sensor',
      status: 'online',
      latestRisk: 'MEDIUM',
      latestRfValue: 2200
    });

    const res = await request(app).get('/api/devices/dev_special');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.deviceId, 'dev_special');
    assert.equal(res.body.data.name, 'Custom-Sensor');
  });

  it('TST-015b: GET /api/devices/:deviceId should return 404 for unknown device', async () => {
    const res = await request(app).get('/api/devices/nonexistent_device');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('not found'));
  });

  it('TST-016: GET /api/devices/:deviceId/latest should return most recent telemetry record', async () => {
    await Telemetry.create([
      {
        deviceId: 'dev_stream',
        rfValue: 1200,
        rfAnomaly: false,
        wifiNetworks: [],
        suspiciousSSID: false,
        cameraButton: false,
        riskLevel: 'SAFE',
        receivedAt: new Date(Date.now() - 10000)
      },
      {
        deviceId: 'dev_stream',
        rfValue: 3400,
        rfAnomaly: true,
        wifiNetworks: [{ ssid: 'spycam_01', suspicious: true }],
        suspiciousSSID: true,
        cameraButton: false,
        riskLevel: 'HIGH',
        receivedAt: new Date()
      }
    ]);

    const res = await request(app).get('/api/devices/dev_stream/latest');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.rfValue, 3400);
    assert.equal(res.body.data.riskLevel, 'HIGH');
  });

  it('TST-017: GET /api/telemetry should return historical records with filtering', async () => {
    await Telemetry.create([
      { deviceId: 'dev_A', rfValue: 800, rfAnomaly: false, suspiciousSSID: false, riskLevel: 'SAFE' },
      { deviceId: 'dev_A', rfValue: 2500, rfAnomaly: true, suspiciousSSID: false, riskLevel: 'MEDIUM' },
      { deviceId: 'dev_B', rfValue: 4000, rfAnomaly: true, suspiciousSSID: true, riskLevel: 'HIGH' }
    ]);

    const resFilter = await request(app).get('/api/telemetry?deviceId=dev_A&riskLevel=MEDIUM');

    assert.equal(resFilter.status, 200);
    assert.equal(resFilter.body.data.length, 1);
    assert.equal(resFilter.body.data[0].rfValue, 2500);
  });

  it('TST-018 & TST-019: GET /api/alerts and PATCH /api/alerts/:id/acknowledge', async () => {
    const alert = await Alert.create({
      deviceId: 'dev_alert_test',
      severity: 'HIGH',
      message: 'Suspicious RF spike and camera SSID detected',
      rfValue: 3500,
      acknowledged: false
    });

    // 1. List alerts
    const resList = await request(app).get('/api/alerts?acknowledged=false');
    assert.equal(resList.status, 200);
    assert.equal(resList.body.data.length, 1);
    assert.equal(resList.body.data[0].acknowledged, false);

    // 2. Acknowledge alert
    const resAck = await request(app).patch(`/api/alerts/${alert._id}/acknowledge`);
    assert.equal(resAck.status, 200);
    assert.equal(resAck.body.success, true);
    assert.equal(resAck.body.data.acknowledged, true);

    // 3. Verify in DB
    const updated = await Alert.findById(alert._id);
    assert.equal(updated.acknowledged, true);
  });

  it('TST-019b: PATCH /api/alerts/:id/acknowledge returns 400 on invalid ID format', async () => {
    const res = await request(app).patch('/api/alerts/not-a-valid-object-id/acknowledge');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('TST-020b: POST /api/telemetry should ingest valid telemetry via REST', async () => {
    const payload = {
      deviceId: 'rest_device_01',
      rfValue: 2600,
      wifiNetworks: [{ ssid: 'Home_WiFi', suspicious: false }],
      cameraButton: false
    };

    const res = await request(app).post('/api/telemetry').send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.telemetry.riskLevel, 'MEDIUM');

    // Confirm device registered
    const dev = await Device.findOne({ deviceId: 'rest_device_01' });
    assert.ok(dev);
    assert.equal(dev.latestRisk, 'MEDIUM');
  });

  it('POST /api/telemetry returns 400 on invalid data', async () => {
    const res = await request(app).post('/api/telemetry').send({
      rfValue: 'bad_number'
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('Returns 404 on unknown endpoint', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

