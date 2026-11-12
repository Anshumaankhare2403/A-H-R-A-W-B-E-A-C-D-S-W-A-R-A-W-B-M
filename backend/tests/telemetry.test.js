import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { processTelemetry } from '../src/services/telemetryService.js';
import Device from '../src/models/Device.js';
import Telemetry from '../src/models/Telemetry.js';
import Alert from '../src/models/Alert.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/anticamera_test_telemetry';

describe('Telemetry Service & Pipeline Integration Tests', () => {
  before(async () => {
    await connectDatabase(TEST_DB_URI);
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

  it('TST-008: should auto-register a new device upon first telemetry arrival', async () => {
    const payload = {
      deviceId: 'test_dev_01',
      timestamp: Date.now(),
      rfValue: 1200,
      wifiNetworks: [{ ssid: 'Home_WiFi', suspicious: false }],
      cameraButton: false
    };

    const result = await processTelemetry(payload);

    assert.equal(result.success, true);
    assert.equal(result.isNewDevice, true);
    assert.equal(result.device.deviceId, 'test_dev_01');
    assert.equal(result.device.status, 'online');
    assert.equal(result.device.latestRisk, 'SAFE');
    assert.equal(result.device.latestRfValue, 1200);

    const savedDevice = await Device.findOne({ deviceId: 'test_dev_01' });
    assert.ok(savedDevice);
    assert.equal(savedDevice.name, 'ESP32-test_dev_01');
  });

  it('TST-009 & TST-010: should persist telemetry history and update existing device state', async () => {
    // First reading (SAFE)
    await processTelemetry({
      deviceId: 'test_dev_02',
      rfValue: 900,
      wifiNetworks: [],
      cameraButton: false
    });

    // Second reading (MEDIUM - RF anomaly)
    const result2 = await processTelemetry({
      deviceId: 'test_dev_02',
      rfValue: 2750,
      wifiNetworks: [],
      cameraButton: false
    });

    assert.equal(result2.isNewDevice, false);
    assert.equal(result2.device.latestRisk, 'MEDIUM');
    assert.equal(result2.device.latestRfValue, 2750);

    // Verify Telemetry collection has both records
    const telemetryHistory = await Telemetry.find({ deviceId: 'test_dev_02' }).sort({ receivedAt: 1 });
    assert.equal(telemetryHistory.length, 2);
    assert.equal(telemetryHistory[0].riskLevel, 'SAFE');
    assert.equal(telemetryHistory[1].riskLevel, 'MEDIUM');
    assert.equal(telemetryHistory[1].rfAnomaly, true);
  });

  it('TST-011: should generate an alert upon entry into a non-SAFE risk condition', async () => {
    const payload = {
      deviceId: 'test_dev_alert',
      rfValue: 3100,
      wifiNetworks: [{ ssid: 'spycam_hidden_01', suspicious: true }],
      cameraButton: false
    };

    const result = await processTelemetry(payload);

    assert.ok(result.alert);
    assert.equal(result.alert.deviceId, 'test_dev_alert');
    assert.equal(result.alert.severity, 'HIGH');
    assert.equal(result.alert.acknowledged, false);
    assert.ok(result.alert.suspiciousSSIDs.includes('spycam_hidden_01'));

    const savedAlert = await Alert.findOne({ deviceId: 'test_dev_alert' });
    assert.ok(savedAlert);
    assert.equal(savedAlert.severity, 'HIGH');
  });

  it('TST-012: should suppress duplicate alerts during consecutive identical non-SAFE readings', async () => {
    const payload = {
      deviceId: 'test_dev_dup',
      rfValue: 2900,
      wifiNetworks: [],
      cameraButton: false
    };

    // First arrival -> Alert generated (MEDIUM)
    const res1 = await processTelemetry(payload);
    assert.ok(res1.alert, 'First arrival should produce alert');

    // Second arrival 5 seconds later with identical condition
    const res2 = await processTelemetry(payload);
    assert.equal(res2.alert, null, 'Consecutive identical arrival should suppress duplicate alert');

    // Verify only 1 alert in DB
    const alertCount = await Alert.countDocuments({ deviceId: 'test_dev_dup' });
    assert.equal(alertCount, 1);
  });

  it('TST-011b: should generate a new alert if risk severity escalates from MEDIUM to HIGH', async () => {
    // First: MEDIUM
    await processTelemetry({
      deviceId: 'test_dev_escalate',
      rfValue: 2400,
      wifiNetworks: [],
      cameraButton: false
    });

    // Escalation: HIGH
    const resHigh = await processTelemetry({
      deviceId: 'test_dev_escalate',
      rfValue: 2800,
      wifiNetworks: [{ ssid: 'spycam_unit_4', suspicious: true }],
      cameraButton: false
    });

    assert.ok(resHigh.alert);
    assert.equal(resHigh.alert.severity, 'HIGH');

    const totalAlerts = await Alert.countDocuments({ deviceId: 'test_dev_escalate' });
    assert.equal(totalAlerts, 2);
  });

  it('TST-005b: should always generate alert when manual camera button is pressed', async () => {
    const res = await processTelemetry({
      deviceId: 'test_dev_btn',
      rfValue: 450,
      wifiNetworks: [],
      cameraButton: true
    });

    assert.ok(res.alert);
    assert.equal(res.alert.severity, 'HIGH');
    assert.ok(res.alert.message.includes('Manual camera detection button'));
  });

  it('TST-007b: should reject invalid telemetry payloads and throw statusCode 400', async () => {
    await assert.rejects(
      async () => {
        await processTelemetry({
          // missing deviceId
          rfValue: 1200
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes('deviceId'));
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await processTelemetry({
          deviceId: 'dev_bad',
          rfValue: -100 // invalid negative RF
        });
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        return true;
      }
    );
  });
});

