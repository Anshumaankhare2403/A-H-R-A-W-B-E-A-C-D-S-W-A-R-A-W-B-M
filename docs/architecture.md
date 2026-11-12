# System Architecture
## Hybrid RF & Wi-Fi Embedded Anti-Camera Detection System

```text
              WOKWI ESP32 SIMULATOR / HARDWARE NODE
                     (MicroPython Firmware)
                               |
                   GPIO 34 (Potentiometer / RF)
                   GPIO 33 (Manual Camera Pushbutton)
                   GPIO 25, 26, 27 (LEDs: Red, Yellow, Green)
                   GPIO 14 (Piezo Buzzer)
                   GPIO 21, 22 (SSD1306 OLED Display I2C)
                               |
                               | MQTT Publish (QoS 1)
                               | Topic: anticamera/{deviceId}/telemetry
                               v
                     MOSQUITTO MQTT BROKER
                        (Port 1883)
                               |
                               | MQTT Subscribe
                               | Topic: anticamera/+/telemetry
                               v
                    NODE.JS / EXPRESS BACKEND
          +--------------------+--------------------+
          |                    |                    |
          v                    v                    v
    RISK ANALYSIS           REST API            SOCKET.IO
       ENGINE             CONTROLLERS          DISPATCHER
   (src/services/       (src/controllers/   (src/sockets/
    riskEngine.js)       *Controller.js)     socketHandler.js)
          |                    |                    |
          | Authoritative      | Query / Ingest     | Real-time
          | Classification     | & Acknowledge      | Push Events
          +--------------------+--------------------+
                               |
                               v
                       MONGODB DATABASE
                          (Port 27017)
                 +-------------+-------------+
                 |             |             |
                 v             v             v
             "devices"   "telemetries"   "alerts"
```

---

## Component Breakdown

### 1. Edge IoT Node (ESP32 / Wokwi)
- **Role:** Physical environmental signal acquisition and fast local threat signaling.
- **Hardware Abstraction:**
  - **RF Sensor:** Potentiometer feeding ADC1_CH6 on GPIO 34 (0 to 4095 scale).
  - **Wi-Fi Scanner:** Heuristic parsing of Wi-Fi beacon SSIDs against surveillance keywords (`spycam`, `camera`, `hidden`, `surveillance`, `monitor`).
  - **Manual Pushbutton:** Active-low interrupt on GPIO 33 for immediate visual confirmation of physical lenses or suspicious hardware by user.
  - **Feedback Actuation:** SSD1306 128x64 I2C OLED display, status LEDs (Red=HIGH, Yellow=MEDIUM, Green=LOW/SAFE), and piezo buzzer alarms.
- **Telemetry Ingestion:** Transmits JSON payload over MQTT every 5 seconds.

### 2. MQTT Broker (Mosquitto)
- **Role:** High-throughput, low-latency, decoupled message bus.
- **Configuration:** Port 1883 for TCP IoT clients.
- **Topics:**
  - `anticamera/{deviceId}/telemetry`: Uplink telemetry stream from node.
  - `anticamera/{deviceId}/status`: Device lifecycle status events (`online`, `offline`).
  - `anticamera/{deviceId}/alerts`: Direct hardware alarm broadcasts.
  - `anticamera/{deviceId}/commands`: Downlink remote actuation channel from backend.

### 3. Node.js Authoritative Backend
- **Framework:** Express.js with ES Modules (Node.js 20+).
- **Core Principle:** **Authoritative Risk Engine**. While the edge device provides immediate local feedback for safety, the backend independently parses raw values and computes the definitive risk score to prevent edge tampering or firmware divergence.
- **Deduplication Engine:** Suppresses redundant identical alerts during continuous 5-second polling cycles to protect operational operators from alert fatigue.
- **Real-Time Push:** WebSockets via Socket.IO emit telemetry records, risk transitions (`risk:changed`), and critical security alerts (`alert:high-risk`) with zero polling overhead.

### 4. Database Layer (MongoDB & Mongoose)
- **Engine:** MongoDB Community Server.
- **Collections:**
  - `devices`: Device registry and live heartbeat tracker.
  - `telemetries`: High-resolution historical time-series telemetry store.
  - `alerts`: Security incidents, severities, and acknowledgment states.
- **Indexing:** Compound indexes on `(deviceId, receivedAt DESC)` and `(acknowledged, severity, occurredAt DESC)` for sub-millisecond query response times.

