# A Hybrid RF and Wi-Fi Based Embedded Anti-Camera Detection System with Adaptive Risk Analysis and Web-Based Monitoring

[![Backend Tests](https://img.shields.io/badge/tests-37%20passed-brightgreen.svg)](#automated-testing)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-blue.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)](https://www.mongodb.com)
[![MQTT](https://img.shields.io/badge/protocol-MQTT%20Mosquitto-orange.svg)](https://mosquitto.org)
[![Wokwi Simulator](https://img.shields.io/badge/simulator-Wokwi%20ESP32-red.svg)](https://wokwi.com/projects/462265376283578369)

---

## 1. Project Introduction

Concealed surveillance cameras present serious privacy vulnerabilities in confidential environments, hotel rooms, and private workspaces. This project implements a **Hybrid RF and Wi-Fi Embedded Anti-Camera Detection System**.

The edge hardware node (ESP32) continuously acquires analog Radio Frequency (RF) signals and scans surrounding Wi-Fi beacon SSIDs for surveillance-associated signatures. It relays structured telemetry over **MQTT** to an authoritative **Node.js/Express** backend, which runs an adaptive risk analysis engine, records high-resolution telemetry into **MongoDB**, triggers deduplicated security alerts, and broadcasts live telemetry and alerts via **Socket.IO** to connected clients.

---

## 2. System Architecture

```text
              WOKWI ESP32 SIMULATOR
              (MicroPython Firmware)
                        |
            Potentiometer (RF) - GPIO 34
            Push Button (Cam)  - GPIO 33
            LEDs (R, Y, G)     - GPIO 25, 26, 27
            Buzzer             - GPIO 14
            SSD1306 OLED       - GPIO 21, 22
                        |
                        | MQTT Publish (5s interval)
                        | Topic: anticamera/{deviceId}/telemetry
                        v
              MOSQUITTO MQTT BROKER
                   (Port 1883)
                        |
                        | MQTT Subscribe
                        | Topic: anticamera/+/telemetry
                        v
                 NODE.JS BACKEND
           +------------+------------+
           |            |            |
           v            v            v
       RISK ENGINE   REST API    SOCKET.IO
     (Authoritative) (Express)   (WebSockets)
           |            |            |
           +------------+------------+
                        |
                        v
                     MONGODB
                   (Port 27017)
                 +------+------+
                 |      |      |
                 v      v      v
              Devices Telemetry Alerts
```

---

## 3. Technology Stack

| Layer | Technology | Version / Specification |
|---|---|---|
| **Edge Hardware / Simulator** | Wokwi ESP32 DevKit C v4 | MicroPython v1.22.0 |
| **Backend Runtime** | Node.js (ES Modules) | v20+ (Verified on v26) |
| **Backend Framework** | Express.js | v4.21.2 |
| **Database** | MongoDB Community Server | v7.0+ (Mongoose v8.9.5) |
| **IoT Protocol** | MQTT (Mosquitto) | v2.0+ (QoS 1) |
| **Real-time Push** | Socket.IO | v4.8.1 |
| **Testing Harness** | Node.js Native Test Runner / Supertest | 37 automated tests |
| **Containerization** | Docker Compose | MongoDB & Mosquitto profiles |

---

## 4. Hardware Pinout Reference (ESP32)

| Component | Part in Wokwi | ESP32 GPIO | Mode / Description |
|---|---|---|---|
| RF Sensor Simulator | Potentiometer (`pot1`) | **GPIO 34** | ADC1_CH6 (Analog 0 - 4095) |
| Manual Camera Button | Pushbutton (`camBtn`) | **GPIO 33** | Active LOW (Internal Pull-Up) |
| Red LED | Status LED (`redLed`) | **GPIO 25** | High-Risk / Camera Alert |
| Yellow LED | Status LED (`yellowLed`) | **GPIO 26** | Medium-Risk (RF Anomaly) |
| Green LED | Status LED (`greenLed`) | **GPIO 27** | Low-Risk / Safe Status |
| Piezo Buzzer | Buzzer (`bz1`) | **GPIO 14** | Audible Alarm on HIGH Risk |
| OLED SDA | SSD1306 I2C (`oled1`) | **GPIO 21** | I2C Data |
| OLED SCL | SSD1306 I2C (`oled1`) | **GPIO 22** | I2C Clock |

---

## 5. Adaptive Risk Analysis Matrix

The Node.js backend operates the authoritative risk assessment logic (`backend/src/services/riskEngine.js`):

- **RF Anomaly Threshold:** Configurable via `.env` (`RF_THRESHOLD=2000`).
- **Suspicious SSID Keywords:** `spycam`, `camera`, `hidden`, `surveillance`, `monitor`.

| RF Anomaly (`rfValue > 2000`) | Suspicious SSID Detected | Manual Button Pressed | Risk Classification | Action Taken |
|---|---|---|---|---|
| No | No | No | **SAFE** | Green LED ON |
| No | Yes | No | **LOW** | Green LED ON, Alert recorded |
| Yes | No | No | **MEDIUM** | Yellow LED ON, Alert recorded |
| Yes | Yes | No | **HIGH** | Red LED ON, Buzzer beep, High-Risk Alert emitted |
| Any | Any | **Yes** | **HIGH** | Red LED ON, Buzzer beep, Immediate Alarm |

> [!NOTE]
> **Scientific Limitation:** RF fluctuations and Wi-Fi SSID heuristic names are statistical risk indicators, not forensic certainty of an active concealed surveillance camera.

---

## 6. Prerequisites

- **Node.js:** v20.0.0 or newer (`node -v`)
- **MongoDB:** Native service or Docker container (`127.0.0.1:27017`)
- **MQTT Broker:** Mosquitto (`127.0.0.1:1883`)
- **Wokwi Account / Browser:** For running the simulated ESP32 hardware

---

## 7. Installation & Quickstart

### Step 1: Clone & Install Backend

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Inspect or edit `backend/.env`:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/anticamera_db
MQTT_BROKER_URL=mqtt://127.0.0.1:1883
RF_THRESHOLD=2000
CORS_ORIGIN=*
```

### Step 3: Start Services (Docker or Native)

#### Option A: Docker Compose (Starts MongoDB & Mosquitto)
```bash
docker compose up -d
```

#### Option B: Native Services (Windows)
If MongoDB is already running as a Windows service:
```powershell
Get-Service -Name MongoDB
```

### Step 4: Run the Backend Server

- **Windows PowerShell:**
  ```powershell
  cmd.exe /c "cd /d backend && npm start"
  ```
- **Linux / macOS:**
  ```bash
  cd backend && npm start
  ```

Server will output:
```text
====================================================
 Starting Hybrid Anti-Camera Detection Backend...  
====================================================
[Database] MongoDB connected successfully: 127.0.0.1:27017/anticamera_db
[Socket.IO] Server initialized and listening for events.
[HTTP Server] Backend API running at http://localhost:5000
[HTTP Server] Health check available at http://localhost:5000/api/health
```

---

## 8. Wokwi ESP32 IoT Simulation

1. Open the existing Wokwi project:
   **[https://wokwi.com/projects/462265376283578369](https://wokwi.com/projects/462265376283578369)**
2. Ensure the code in `iot/wokwi-esp32/main.py` is copied to the Wokwi `main.py` tab.
3. Choose your MQTT bridge method:
   - **Private IoT Gateway (Recommended for local dev):** Run [Wokwi Private IoT Gateway](https://docs.wokwi.com/guides/private-iot-gateway). The ESP32 communicates with `host.wokwi.internal:1883`.
   - **Public Broker (Zero-install fallback):** Set `MQTT_BROKER = "broker.hivemq.com"` in both `main.py` and `backend/.env`.
4. Click **Start Simulation** in Wokwi.
   - Adjust the potentiometer slider to simulate RF levels above or below 2000.
   - Click the red button to simulate direct camera detection.
   - Observe OLED display, LEDs, buzzer, and serial telemetry outputs.

---

## 9. Automated Testing

Run the comprehensive 37-test automated verification suite:

```bash
cd backend
npm test
```

### Test Suite Results:
- **Risk Engine Unit Tests:** 15/15 passed (all matrices, thresholds, and edge cases)
- **Telemetry Service Tests:** 7/7 passed (auto-registration, history, deduplication, escalation)
- **REST API Tests:** 11/11 passed (health, devices, telemetry, alerts, pagination, ack)
- **MQTT Pipeline Tests:** 3/3 passed (ingestion, malformed JSON recovery, topic fallback)
- **Socket.IO Event Tests:** 1/1 passed (real-time broadcast verification)
- **Total:** **37 tests, 0 failures.**

---

## 10. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and dependency status |
| `GET` | `/api/devices` | List registered devices |
| `GET` | `/api/devices/:deviceId` | Single device details |
| `GET` | `/api/devices/:deviceId/latest` | Most recent telemetry |
| `GET` | `/api/telemetry` | Telemetry history (with query filters) |
| `GET` | `/api/telemetry/:deviceId` | Device-specific telemetry |
| `POST` | `/api/telemetry` | Ingest telemetry via HTTP |
| `GET` | `/api/alerts` | Alert history (with filters) |
| `PATCH` | `/api/alerts/:id/acknowledge` | Acknowledge alert |

---

## 11. Documentation Directory

Detailed architectural and operational documentation is available in `docs/`:
- [Architecture & Data Flow](docs/architecture.md)
- [REST API Specification](docs/api-documentation.md)
- [MQTT Topics & Payloads](docs/mqtt-topics.md)
- [Wokwi Simulation Setup](docs/wokwi-setup.md)
- [Database Schema & Indexes](docs/database-schema.md)
- [Testing & QA Guide](docs/testing-guide.md)
- [Troubleshooting Manual](docs/troubleshooting.md)
