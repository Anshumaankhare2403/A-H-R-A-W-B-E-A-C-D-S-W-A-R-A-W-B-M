import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase } from './setupDb.js';
import { processTelemetry } from '../src/services/telemetryService.js';
import { Telemetry } from '../src/models/Telemetry.js';
import { Alert } from '../src/models/Alert.js';

describe('Telemetry Processing & Alert Generation Pipeline', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 300000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it('TEST-011: processes and saves valid telemetry message', async () => {
    const payload = {
      deviceId: 'device001',
      timestamp: 1794468600,
      rfValue: 2800,
      wifiNetworks: [
        { ssid: 'Home_WiFi', suspicious: false },
        { ssid: 'spycam_device', suspicious: true }
      ],
      cameraButton: false
    };

    const result = await processTelemetry(payload);
    expect(result.success).toBe(true);
    expect(result.telemetry).toBeDefined();
    expect(result.telemetry.deviceId).toBe('device001');
    expect(result.telemetry.rfValue).toBe(2800);
    expect(result.telemetry.rfAnomaly).toBe(true);
    expect(result.telemetry.suspiciousSSID).toBe(true);
    expect(result.telemetry.riskLevel).toBe('HIGH');

    const saved = await Telemetry.findById(result.telemetry._id);
    expect(saved).not.toBeNull();
    expect(saved.deviceId).toBe('device001');
  });

  it('calculates authoritative risk on backend even if ESP32 attempts spoofing', async () => {
    const payload = {
      deviceId: 'spoof_dev',
      timestamp: 1794468610,
      rfValue: 3200,
      wifiNetworks: [{ ssid: 'hidden_camera_99' }],
      cameraButton: false,
      riskLevel: 'SAFE'
    };

    const result = await processTelemetry(payload);
    expect(result.success).toBe(true);
    expect(result.telemetry.riskLevel).toBe('HIGH');
  });

  it('TEST-012: creates an alert for non-SAFE risk states', async () => {
    const payload = {
      deviceId: 'device002',
      timestamp: 1794468620,
      rfValue: 2400,
      wifiNetworks: ['Home_WiFi'],
      cameraButton: false
    };

    const result = await processTelemetry(payload);
    expect(result.success).toBe(true);
    expect(result.alert).not.toBeNull();
    expect(result.alert.severity).toBe('MEDIUM');
    expect(result.alert.deviceId).toBe('device002');
    expect(result.alert.acknowledged).toBe(false);

    const alertCount = await Alert.countDocuments({ deviceId: 'device002' });
    expect(alertCount).toBe(1);
  });

  it('TEST-013: prevents duplicate alerts while risk level remains unchanged', async () => {
    const payload1 = {
      deviceId: 'device003',
      timestamp: 1794468630,
      rfValue: 2500,
      wifiNetworks: [],
      cameraButton: false
    };

    const firstResult = await processTelemetry(payload1);
    expect(firstResult.alert).not.toBeNull();
    expect(firstResult.alert.severity).toBe('MEDIUM');

    const payload2 = {
      deviceId: 'device003',
      timestamp: 1794468635,
      rfValue: 2600,
      wifiNetworks: [],
      cameraButton: false
    };

    const secondResult = await processTelemetry(payload2);
    expect(secondResult.success).toBe(true);
    expect(secondResult.alert).toBeNull();

    const totalAlerts = await Alert.countDocuments({ deviceId: 'device003' });
    expect(totalAlerts).toBe(1);
  });

  it('generates a new alert when risk transitions from MEDIUM to HIGH', async () => {
    await processTelemetry({
      deviceId: 'device004',
      timestamp: 1794468640,
      rfValue: 2200,
      wifiNetworks: [],
      cameraButton: false
    });

    const escalated = await processTelemetry({
      deviceId: 'device004',
      timestamp: 1794468645,
      rfValue: 2400,
      wifiNetworks: ['spycam_livingroom'],
      cameraButton: false
    });

    expect(escalated.alert).not.toBeNull();
    expect(escalated.alert.severity).toBe('HIGH');

    const totalAlerts = await Alert.countDocuments({ deviceId: 'device004' });
    expect(totalAlerts).toBe(2);
  });

  it('TEST-023: rejects invalid telemetry payload gracefully without DB pollution', async () => {
    const missingDevId = await processTelemetry({
      rfValue: 1200,
      wifiNetworks: []
    });
    expect(missingDevId.success).toBe(false);
    expect(missingDevId.error).toContain('deviceId');

    const negativeRf = await processTelemetry({
      deviceId: 'dev_neg',
      rfValue: -100
    });
    expect(negativeRf.success).toBe(false);
    expect(negativeRf.error).toContain('rfValue');

    const invalidWifi = await processTelemetry({
      deviceId: 'dev_wifi',
      rfValue: 1200,
      wifiNetworks: 'invalid-string'
    });
    expect(invalidWifi.success).toBe(false);
    expect(invalidWifi.error).toContain('wifiNetworks');

    const count = await Telemetry.countDocuments({ deviceId: 'dev_neg' });
    expect(count).toBe(0);
  });
});
