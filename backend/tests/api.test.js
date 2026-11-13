import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase } from './setupDb.js';
import { createApp } from '../src/server.js';
import { Device } from '../src/models/Device.js';
import { Telemetry } from '../src/models/Telemetry.js';
import { Alert } from '../src/models/Alert.js';

describe('REST API Endpoints Suite', () => {
  let app;

  beforeAll(async () => {
    await setupTestDatabase();
    app = createApp();
  }, 300000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('GET /api/health', () => {
    it('TEST-014: returns 200 with healthy backend message', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Backend is running');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('Device Endpoints', () => {
    beforeEach(async () => {
      await Device.create([
        { deviceId: 'dev_01', latestRisk: 'SAFE', status: 'ONLINE', latestRfValue: 100 },
        { deviceId: 'dev_02', latestRisk: 'HIGH', status: 'ALERT', latestRfValue: 3500 },
        { deviceId: 'dev_03', latestRisk: 'MEDIUM', status: 'WARNING', latestRfValue: 2200 }
      ]);
    });

    it('TEST-015: GET /api/devices returns paginated devices with filtering', async () => {
      const res = await request(app).get('/api/devices?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);

      const alertRes = await request(app).get('/api/devices?status=ALERT');
      expect(alertRes.status).toBe(200);
      expect(alertRes.body.data).toHaveLength(1);
      expect(alertRes.body.data[0].deviceId).toBe('dev_02');
    });

    it('TEST-016: GET /api/devices/:deviceId returns device details or 404', async () => {
      const res = await request(app).get('/api/devices/dev_01');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deviceId).toBe('dev_01');

      const notFoundRes = await request(app).get('/api/devices/nonexistent_device');
      expect(notFoundRes.status).toBe(404);
      expect(notFoundRes.body.success).toBe(false);
    });

    it('TEST-017: GET /api/devices/:deviceId/latest returns latest telemetry for device', async () => {
      await Telemetry.create({
        deviceId: 'dev_01',
        deviceTimestamp: 1794468600,
        rfValue: 1250,
        rfAnomaly: false,
        wifiNetworks: [{ ssid: 'Home_WiFi', suspicious: false }],
        riskLevel: 'SAFE'
      });

      const res = await request(app).get('/api/devices/dev_01/latest');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.device.deviceId).toBe('dev_01');
      expect(res.body.data.latestTelemetry).not.toBeNull();
      expect(res.body.data.latestTelemetry.rfValue).toBe(1250);
    });
  });

  describe('Telemetry Endpoints', () => {
    beforeEach(async () => {
      await Telemetry.create([
        { deviceId: 'dev_t1', deviceTimestamp: 100, rfValue: 500, rfAnomaly: false, riskLevel: 'SAFE' },
        { deviceId: 'dev_t1', deviceTimestamp: 200, rfValue: 2500, rfAnomaly: true, riskLevel: 'MEDIUM' },
        { deviceId: 'dev_t2', deviceTimestamp: 300, rfValue: 3500, rfAnomaly: true, riskLevel: 'HIGH' }
      ]);
    });

    it('TEST-018: GET /api/telemetry supports query filtering', async () => {
      const res = await request(app).get('/api/telemetry?deviceId=dev_t1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);

      const highRes = await request(app).get('/api/telemetry?riskLevel=HIGH');
      expect(highRes.status).toBe(200);
      expect(highRes.body.data).toHaveLength(1);
      expect(highRes.body.data[0].deviceId).toBe('dev_t2');
    });

    it('GET /api/telemetry/:deviceId returns historical readings', async () => {
      const res = await request(app).get('/api/telemetry/dev_t1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('POST /api/telemetry ingests and validates new telemetry reading', async () => {
      const res = await request(app)
        .post('/api/telemetry')
        .send({
          deviceId: 'dev_new_post',
          timestamp: 1794468700,
          rfValue: 3100,
          wifiNetworks: [{ ssid: 'spycam_hotel', suspicious: true }],
          cameraButton: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.telemetry.riskLevel).toBe('HIGH');
      expect(res.body.data.alert).not.toBeNull();
      expect(res.body.data.device.status).toBe('ALERT');
    });
  });

  describe('Alert Endpoints', () => {
    let alertId;

    beforeEach(async () => {
      const alert = await Alert.create({
        deviceId: 'dev_alert_1',
        severity: 'HIGH',
        message: 'High risk camera detected',
        rfValue: 3800,
        suspiciousSSIDs: ['spycam_room1'],
        acknowledged: false
      });
      alertId = alert._id.toString();
    });

    it('TEST-019: GET /api/alerts retrieves alerts with severity and acknowledgment filters', async () => {
      const res = await request(app).get('/api/alerts?severity=HIGH&acknowledged=false');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].deviceId).toBe('dev_alert_1');
    });

    it('TEST-020: PATCH /api/alerts/:id/acknowledge updates acknowledgment status', async () => {
      const res = await request(app).patch(`/api/alerts/${alertId}/acknowledge`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.acknowledged).toBe(true);
      expect(res.body.data.acknowledgedAt).toBeDefined();

      const inDb = await Alert.findById(alertId);
      expect(inDb.acknowledged).toBe(true);
    });

    it('returns 400 for malformed alert ID on acknowledge', async () => {
      const res = await request(app).patch('/api/alerts/invalid-mongo-id/acknowledge');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 for non-existent alert ID on acknowledge', async () => {
      const nonExistent = '507f1f77bcf86cd799439011';
      const res = await request(app).patch(`/api/alerts/${nonExistent}/acknowledge`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
