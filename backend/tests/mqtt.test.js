import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import net from 'net';
import Aedes from 'aedes';
import mqtt from 'mqtt';
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase } from './setupDb.js';
import { startMqttSubscriber, stopMqttSubscriber, extractDeviceIdFromTopic } from '../src/services/mqttService.js';
import { Telemetry } from '../src/models/Telemetry.js';
import { Device } from '../src/models/Device.js';

describe('MQTT Pipeline & Broker Resilience Suite', () => {
  let aedesBroker;
  let tcpServer;
  const testBrokerPort = 18883;
  const brokerUrl = `mqtt://127.0.0.1:${testBrokerPort}`;
  let testPublisher;

  beforeAll(async () => {
    await setupTestDatabase();

    aedesBroker = new Aedes();
    tcpServer = net.createServer(aedesBroker.handle);

    await new Promise((resolve) => {
      tcpServer.listen(testBrokerPort, '127.0.0.1', resolve);
    });

    startMqttSubscriber(brokerUrl);

    testPublisher = mqtt.connect(brokerUrl, {
      clientId: 'esp32_simulator_test_client'
    });

    await new Promise((resolve) => {
      testPublisher.on('connect', resolve);
    });
  }, 300000);

  afterAll(async () => {
    if (testPublisher) {
      await new Promise((resolve) => testPublisher.end(false, resolve));
    }
    await stopMqttSubscriber();
    if (tcpServer) {
      await new Promise((resolve) => tcpServer.close(resolve));
    }
    if (aedesBroker) {
      await new Promise((resolve) => aedesBroker.close(resolve));
    }
    await teardownTestDatabase();
  });

  it('correctly extracts deviceId from topic string', () => {
    expect(extractDeviceIdFromTopic('anticamera/device123/telemetry')).toBe('device123');
    expect(extractDeviceIdFromTopic('anticamera/device999/status')).toBe('device999');
    expect(extractDeviceIdFromTopic('other/topic/here')).toBeNull();
  });

  it('TEST-021: ingests and persists valid MQTT telemetry from simulated ESP32', async () => {
    const payload = {
      deviceId: 'mqtt_dev_01',
      timestamp: 1794468800,
      rfValue: 2950,
      wifiNetworks: [
        { ssid: 'Office_WiFi', suspicious: false },
        { ssid: 'hidden_cam_test', suspicious: true }
      ],
      cameraButton: false
    };

    await new Promise((resolve, reject) => {
      testPublisher.publish(
        'anticamera/mqtt_dev_01/telemetry',
        JSON.stringify(payload),
        { qos: 1 },
        (err) => (err ? reject(err) : resolve())
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    const record = await Telemetry.findOne({ deviceId: 'mqtt_dev_01' });
    expect(record).not.toBeNull();
    expect(record.rfValue).toBe(2950);
    expect(record.riskLevel).toBe('HIGH');

    const device = await Device.findOne({ deviceId: 'mqtt_dev_01' });
    expect(device).not.toBeNull();
    expect(device.status).toBe('ALERT');
  });

  it('TEST-022: handles malformed JSON without crashing backend process', async () => {
    const malformedPayload = '{"deviceId": "bad_json", rfValue: INVALID...';

    await new Promise((resolve, reject) => {
      testPublisher.publish(
        'anticamera/bad_device/telemetry',
        malformedPayload,
        { qos: 1 },
        (err) => (err ? reject(err) : resolve())
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 400));

    const validFollowup = {
      deviceId: 'mqtt_dev_02',
      timestamp: 1794468810,
      rfValue: 500,
      wifiNetworks: ['Home_WiFi'],
      cameraButton: false
    };

    await new Promise((resolve, reject) => {
      testPublisher.publish(
        'anticamera/mqtt_dev_02/telemetry',
        JSON.stringify(validFollowup),
        { qos: 1 },
        (err) => (err ? reject(err) : resolve())
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    const followupRecord = await Telemetry.findOne({ deviceId: 'mqtt_dev_02' });
    expect(followupRecord).not.toBeNull();
    expect(followupRecord.riskLevel).toBe('SAFE');
  });
});
