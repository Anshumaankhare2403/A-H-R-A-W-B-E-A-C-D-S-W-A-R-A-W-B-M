# MQTT Topics Specification
## Hybrid Anti-Camera Detection System

- **Broker Default Port:** `1883`
- **Default QoS Level:** `1` (At least once delivery)
- **Topic Namespace:** `anticamera/{deviceId}/*`

---

## Topic Architecture

```text
anticamera/
├── {deviceId}/
│   ├── telemetry    (Uplink: Sensor data stream from ESP32 to Backend)
│   ├── status       (Uplink: Edge node lifecycle state)
│   ├── alerts       (Uplink: Edge hardware triggered alarms)
│   └── commands     (Downlink: Backend remote control to ESP32)
```

---

## Topic Details

### 1. Telemetry Ingestion
- **Topic:** `anticamera/{deviceId}/telemetry`
- **Direction:** ESP32 -> Backend Subscriber
- **Publish Frequency:** Every 5 seconds
- **Payload Schema:**
```json
{
  "deviceId": "esp32_dev01",
  "timestamp": 1794468600,
  "rfValue": 2850,
  "wifiNetworks": [
    {
      "ssid": "Home_WiFi",
      "suspicious": false
    },
    {
      "ssid": "spycam_device",
      "suspicious": true
    }
  ],
  "cameraButton": false
}
```

### 2. Device Status
- **Topic:** `anticamera/{deviceId}/status`
- **Direction:** ESP32 -> Backend Subscriber
- **Events:** Emitted on initial boot, Wi-Fi reconnection, or Last Will and Testament (LWT).
- **Payload Schema:**
```json
{
  "deviceId": "esp32_dev01",
  "status": "online",
  "firmware": "1.0.0-micropython"
}
```

### 3. Edge Commands
- **Topic:** `anticamera/{deviceId}/commands`
- **Direction:** Backend -> ESP32
- **Purpose:** Remote trigger of buzzer mute, calibration, or diagnostic beep.
- **Payload Schema:**
```json
{
  "action": "beep",
  "durationMs": 500
}
```

---

## Backend Wildcard Subscription

The Node.js backend subscribes to:
```text
anticamera/+/telemetry
anticamera/+/status
```
The single-level wildcard `+` enables dynamic horizontal scaling to any number of deployed ESP32 nodes without code modifications.

