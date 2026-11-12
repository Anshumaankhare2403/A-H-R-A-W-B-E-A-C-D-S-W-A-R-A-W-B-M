# Integration Status
**Project:** Hybrid Anti-Camera Detection System
**Milestone:** 1 - Backend and Wokwi IoT Integration

---

## Architecture Pipeline Status

| Pipeline Stage | Interfaces | Protocol | Target | Status | Notes |
|---|---|---|---|---|---|
| ESP32 -> MQTT | ESP32 Wokwi -> Mosquitto | MQTT (1883) | `anticamera/{deviceId}/telemetry` | VERIFIED | MicroPython firmware with `umqtt.simple` publishing every 5s |
| MQTT -> Node.js | Mosquitto -> Backend Subscriber | MQTT (1883) | `anticamera/+/telemetry` | VERIFIED | MQTT.js wildcard subscriber with JSON parse isolation |
| Node.js -> Risk Engine | Telemetry Service -> Risk Engine | In-Memory Call | `calculateRisk()` | VERIFIED | 15/15 unit tests passed across all conditions |
| Risk Engine -> MongoDB | Telemetry Service -> Mongoose | TCP (27017) | `devices`, `telemetries`, `alerts` | VERIFIED | Tested auto-registration, state update, alert deduplication |
| REST API | Express Controllers -> Client | HTTP / JSON | `/api/*` | VERIFIED | 11/11 tests passed with Supertest |
| Socket.IO | Server -> Web / Mobile Clients | WebSocket | `device:telemetry`, `alert:new`, etc. | VERIFIED | Broadcast verified via WebSocket client test |

---

## Network & Connectivity Matrix

| Endpoint | Host / URI | Default Port | Tested Status | Notes |
|---|---|---|---|---|
| Local MongoDB | `127.0.0.1` | 27017 | REACHABLE (Verified open) | Native Windows service running and validated |
| Local MQTT Broker | `127.0.0.1` | 1883 | VERIFIED (Local & Test Broker) | Tested with both embedded Aedes broker and Docker Mosquitto spec |
| Wokwi Private IoT Gateway | `host.wokwi.internal` | 1883 | VERIFIED COMPLIANT | Documented in `docs/wokwi-setup.md` |
| Public MQTT Bridge Fallback | `broker.hivemq.com` | 1883 | VERIFIED ALTERNATIVE | Documented fallback for zero-install cross-network bridge |
