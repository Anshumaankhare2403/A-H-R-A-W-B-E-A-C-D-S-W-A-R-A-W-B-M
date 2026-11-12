/**
 * ESP32 Wokwi Telemetry Simulator (Node.js test harness)
 * Simulates the ESP32 MicroPython firmware publishing telemetry via MQTT.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mqtt = require('../backend/node_modules/mqtt');

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1:1883';
const DEVICE_ID = process.argv[2] || 'esp32_sim_01';

console.log(`[Simulator] Connecting to MQTT broker at ${BROKER_URL} as ${DEVICE_ID}...`);

const client = mqtt.connect(BROKER_URL, {
  clientId: `sim_${DEVICE_ID}`,
  clean: true
});

const scenarios = [
  { name: 'SAFE', rfValue: 850, wifi: [{ ssid: 'Home_WiFi', suspicious: false }], btn: false },
  { name: 'LOW RISK (SSID)', rfValue: 1200, wifi: [{ ssid: 'Home_WiFi', suspicious: false }, { ssid: 'spycam_dev', suspicious: true }], btn: false },
  { name: 'MEDIUM RISK (RF Anomaly)', rfValue: 2750, wifi: [{ ssid: 'Home_WiFi', suspicious: false }], btn: false },
  { name: 'HIGH RISK (RF + SSID)', rfValue: 3300, wifi: [{ ssid: 'hidden_camera_02', suspicious: true }], btn: false },
  { name: 'HIGH RISK (Manual Button)', rfValue: 900, wifi: [{ ssid: 'Home_WiFi', suspicious: false }], btn: true }
];

let index = 0;

client.on('connect', () => {
  console.log('[Simulator] Connected successfully! Beginning telemetry loop (5s interval)...');

  // Subscribe to commands
  client.subscribe(`anticamera/${DEVICE_ID}/commands`, (err) => {
    if (!err) console.log(`[Simulator] Subscribed to anticamera/${DEVICE_ID}/commands`);
  });

  client.on('message', (topic, msg) => {
    console.log(`[Simulator] Received command on ${topic}:`, msg.toString());
  });

  setInterval(() => {
    const scenario = scenarios[index % scenarios.length];
    const payload = {
      deviceId: DEVICE_ID,
      timestamp: Math.floor(Date.now() / 1000),
      rfValue: scenario.rfValue,
      wifiNetworks: scenario.wifi,
      cameraButton: scenario.btn
    };

    const topic = `anticamera/${DEVICE_ID}/telemetry`;
    client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error('[Simulator] Failed to publish:', err.message);
      } else {
        console.log(`[Simulator] Published [${scenario.name}]: RF=${scenario.rfValue}, Button=${scenario.btn} to ${topic}`);
      }
    });

    index++;
  }, 5000);
});

client.on('error', (err) => {
  console.error('[Simulator] MQTT Error:', err.message);
});

