# A Hybrid RF and Wi-Fi Based Embedded Anti-Camera Detection System with Adaptive Risk Analysis and Web-Based Monitoring

## Milestone 1: Node.js Backend + MongoDB + MQTT + Wokwi ESP32 Integration

This repository contains the complete production-grade source code, configurations, embedded firmware, test suites, and documentation for **Milestone 1**.

---

## 1. System Architecture

```text
              WOKWI SIMULATOR
                    |
                    |
               ESP32 DEVICE
                    |
                    | MQTT (1883)
                    v
             MOSQUITTO BROKER
                    |
                    | Subscribed Ingestion
                    v
             NODE.JS BACKEND
                    |
          +---------+---------+
          |         |         |
          v         v         v
       RISK      MONGODB   SOCKET.IO
      ENGINE        |         |
          |         |         |
          +---------+---------+
                    |
                    v
                REST API
                    |
                    v
          FUTURE WEB AND FLUTTER
               APPLICATIONS
```

---

## 2. Technology Stack

- **Backend Platform**: Node.js (`v24.x` / `v20.x`) with ES Modules (`type: module`)
- **Web Framework**: Express.js 4.x
- **Database & ODM**: MongoDB 7.0 & Mongoose 8.x
- **IoT Messaging Protocol**: MQTT 3.1.1
- **MQTT Broker**: Eclipse Mosquitto 2.0 (Dockerized)
- **Real-Time Client Messaging**: Socket.IO 4.x
- **Embedded MCU Simulation**: ESP32 DevKit v1 running MicroPython in Wokwi
- **Automated Testing Suite**: Vitest 2.x & Supertest 7.x
- **Containerization**: Docker Compose

---

## 3. Quick Start Guide

### Step 1: Start Infrastructure (Docker)
```powershell
docker compose up -d
```

### Step 2: Configure Environment & Run Backend
```powershell
cd backend
npm run dev
```

### Step 3: Run Automated Tests (37 Tests - 100% Pass)
```powershell
npm --prefix backend test
```
