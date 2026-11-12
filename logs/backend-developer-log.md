# Backend Developer Log
**Role:** Senior Node.js Backend Developer
**Project:** Hybrid Anti-Camera Detection System

---

## Log Entries

### [2026-11-12 14:35:00] - Initialization & Dependency Setup
- **Task:** Configure Node.js backend workspace with ES modules, Express, Mongoose, MQTT.js, Socket.IO, Dotenv, and testing harness.
- **Actions:**
  - Initialized `backend/package.json` with ESM configuration (`"type": "module"`).
  - Created `.env.example` and local `.env` with configurable parameters.
  - Executed `npm install` in `backend/`.
- **Status:** Complete.

### [2026-11-12 14:38:00] - Database Configuration & Schemas
- **Task:** Implement MongoDB connection and Mongoose models.
- **Files Created:**
  - `src/config/database.js`: Connection manager with event handlers for error, disconnect, and reconnect.
  - `src/models/Device.js`: Tracks `deviceId`, `name`, `status`, `lastSeen`, `latestRisk`, `latestRfValue`.
  - `src/models/Telemetry.js`: Time-series collection storing `deviceId`, `rfValue`, `rfAnomaly`, `wifiNetworks`, `suspiciousSSID`, `cameraButton`, `riskLevel`.
  - `src/models/Alert.js`: Incident collection storing `deviceId`, `severity`, `message`, `rfValue`, `suspiciousSSIDs`, `acknowledged`.
- **Design Decisions:** Created compound indexes on `(deviceId, receivedAt: -1)` and `(acknowledged, severity, occurredAt: -1)`.

### [2026-11-12 14:40:00] - Authoritative Risk Engine & Telemetry Pipeline
- **Task:** Build risk engine and telemetry processing pipeline.
- **Files Created:**
  - `src/services/riskEngine.js`: Authoritative risk calculation evaluating RF anomaly (> threshold), suspicious Wi-Fi keywords (`spycam`, `camera`, `hidden`, `surveillance`, `monitor`), and manual camera button override.
  - `src/utils/validators.js`: Validates deviceId, non-negative rfValue, timestamp, and array structures.
  - `src/services/telemetryService.js`: Ingestion pipeline handling device auto-registration, state updates, telemetry storage, and duplicate alert suppression.
- **Deduplication Strategy:** Implemented `ALERT_DUPLICATE_COOLDOWN_MS = 5 * 60 * 1000`. Consecutive identical alerts within 5 minutes are suppressed, while risk state transitions and button presses generate immediate alerts.

### [2026-11-12 14:43:00] - REST API, Socket.IO, & Server Initialization
- **Task:** Build REST controllers, Express router, Socket.IO broadcaster, and server startup.
- **Files Created:**
  - `src/controllers/deviceController.js`
  - `src/controllers/telemetryController.js`
  - `src/controllers/alertController.js`
  - `src/routes/deviceRoutes.js`
  - `src/routes/telemetryRoutes.js`
  - `src/routes/alertRoutes.js`
  - `src/sockets/socketHandler.js`
  - `src/app.js`
  - `src/server.js`
- **Endpoints Implemented:**
  - `GET /api/health`
  - `GET /api/devices`
  - `GET /api/devices/:deviceId`
  - `GET /api/devices/:deviceId/latest`
  - `GET /api/telemetry`
  - `GET /api/telemetry/:deviceId`
  - `POST /api/telemetry`
  - `GET /api/alerts`
  - `PATCH /api/alerts/:id/acknowledge`
- **Status:** Complete and verified with Supertest.
