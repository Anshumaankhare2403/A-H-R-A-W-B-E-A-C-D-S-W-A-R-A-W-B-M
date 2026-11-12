import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import net from 'net';
import aedes from 'aedes';
import mqtt from 'mqtt';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { startMqttService } from '../src/services/mqttService.js';
import Device from '../src/models/Device.js';
import Telemetry from '../src/models/Telemetry.js';
import Alert from '../src/models/Alert.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/anticamera_test_mqtt';
const TEST_BROKER_PORT = 18883;
const TEST_BROKER_URL = `mqtt://127.0.0.1:${TEST_BROKER_PORT}`;

describe('MQTT Ingestion Service Integration Tests', () => {
  let aedesInstance;
  let brokerServer;
  let backendClient;
  let testPublisher;

  before(async () => {
    // 1. Connect MongoDB
    await connectDatabase(TEST_DB_URI);

    // 2. Start Embedded Aedes MQTT Broker for Test Suite
    aedesInstance = aedes();
    brokerServer = net.createServer(aedesInstance.handle);

    await new Promise((resolve) => {
      brokerServer.listen(TEST_BROKER_PORT, '127.0.0.1', () => {
        resolve();
      });
    });

    // 3. Connect Backend MQTT Subscriber
    backendClient = mqtt.connect(TEST_BROKER_URL, {
      clientId: 'test_backend_sub',
      clean: true
    });

    await new Promise((resolve) => {
      backendClient.on('connect', () => {
        startMqttService(backendClient);
        resolve();
      });
    });

    // 4. Connect Publisher Client
    testPublisher = mqtt.connect(TEST_BROKER_URL, {
      clientId: 'test_esp32_pub',
      clean: true
    });

    await new Promise((resolve) => {
      testPublisher.on('connect', () => resolve());
    });
  });

  after(async () => {
    if (testPublisher) {
      await new Promise((res) => testPublisher.end(true, res));
    }
    if (backendClient) {
      await new Promise((res) => backendClient.end(true, res));
    }
    if (brokerServer) {
      await new Promise((res) => brokerServer.close(res));
    }
    if (aedesInstance) {
      await new Promise((res) => aedesInstance.close(res));
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

  it('TST-021: should ingest valid MQTT telemetry message and persist to database', async () => {
    const topic = 'anticamera/esp32_mqtt_01/telemetry';
    const message = JSON.stringify({
      deviceId: 'esp32_mqtt_01',
      timestamp: Math.floor(Date.now() / 1000),
      rfValue: 2850,
      wifiNetworks: [
        { ssid: 'Home_WiFi', suspicious: false },
        { ssid: 'spycam_unit_x', suspicious: true }
      ],
      cameraButton: false
    });

    testPublisher.publish(topic, message, { qos: 1 });

    // Wait for async processing
    await new Promise((res) => setTimeout(res, 500));

    // Verify Device created
    const device = await Device.findOne({ deviceId: 'esp32_mqtt_01' });
    assert.ok(device);
    assert.equal(device.latestRisk, 'HIGH');
    assert.equal(device.latestRfValue, 2850);

    // Verify Telemetry saved
    const telemetry = await Telemetry.findOne({ deviceId: 'esp32_mqtt_01' });
    assert.ok(telemetry);
    assert.equal(telemetry.rfAnomaly, true);
    assert.equal(telemetry.suspiciousSSID, true);
    assert.equal(telemetry.riskLevel, 'HIGH');

    // Verify Alert generated
    const alert = await Alert.findOne({ deviceId: 'esp32_mqtt_01' });
    assert.ok(alert);
    assert.equal(alert.severity, 'HIGH');
  });

  it('TST-021b: should safely handle malformed JSON without crashing backend', async () => {
    const topic = 'anticamera/esp32_bad/telemetry';
    const brokenJson = '{ deviceId: "broken", rfValue: ';

    testPublisher.publish(topic, brokenJson, { qos: 1 });

    await new Promise((res) => setTimeout(res, 300));

    // Confirm no crash and nothing corrupted in DB
    const count = await Telemetry.countDocuments({ deviceId: 'esp32_bad' });
    assert.equal(count, 0);
  });

  it('TST-021c: should automatically adopt deviceId from topic if omitted from JSON', async () => {
    const topic = 'anticamera/inferred_device_99/telemetry';
    const payloadWithoutId = JSON.stringify({
      rfValue: 800,
      wifiNetworks: [],
      cameraButton: false
    });

    testPublisher.publish(topic, payloadWithoutId, { qos: 1 });

    await new Promise((res) => setTimeout(res, 500));

    const device = await Device.findOne({ deviceId: 'inferred_device_99' });
    assert.ok(device);
    assert.equal(device.latestRisk, 'SAFE');
  });
});

