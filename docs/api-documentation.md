# REST API Documentation
## Hybrid Anti-Camera Detection Backend

- **Base URL:** `http://localhost:5000/api`
- **Content-Type:** `application/json`

---

## Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health check and dependency connectivity |
| `GET` | `/devices` | List registered ESP32 devices with pagination |
| `GET` | `/devices/:deviceId` | Retrieve single device profile and state |
| `GET` | `/devices/:deviceId/latest` | Retrieve latest telemetry record for device |
| `GET` | `/telemetry` | Query telemetry history across all devices with filters |
| `GET` | `/telemetry/:deviceId` | Query telemetry history for specific device |
| `POST` | `/telemetry` | Ingest telemetry payload via REST (HTTP fallback) |
| `GET` | `/alerts` | Query detection alerts with pagination and filters |
| `PATCH` | `/alerts/:id/acknowledge` | Acknowledge an open alert record |

---

## Detailed Endpoint Specifications

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Response (200 OK):**
```json
{
  "success": true,
  "service": "Hybrid Anti-Camera Detection Backend",
  "version": "1.0.0",
  "uptime": 128.45,
  "timestamp": "2026-11-12T09:15:00.000Z",
  "dependencies": {
    "database": {
      "type": "MongoDB",
      "status": "connected"
    },
    "mqttBroker": {
      "url": "mqtt://127.0.0.1:1883",
      "status": "connected"
    }
  },
  "configuration": {
    "rfThreshold": 2000,
    "environment": "development"
  }
}
```

---

### 2. List Devices
- **Endpoint:** `GET /api/devices`
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
  - `status` (optional, e.g., `online`, `offline`)
  - `risk` (optional, e.g., `SAFE`, `LOW`, `MEDIUM`, `HIGH`)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6733230b80678d91a92e10a1",
      "deviceId": "esp32_dev01",
      "name": "ESP32-esp32_dev01",
      "status": "online",
      "latestRisk": "HIGH",
      "latestRfValue": 2850,
      "lastSeen": "2026-11-12T09:14:55.120Z",
      "createdAt": "2026-11-12T09:00:00.000Z",
      "updatedAt": "2026-11-12T09:14:55.120Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### 3. Device Details
- **Endpoint:** `GET /api/devices/:deviceId`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deviceId": "esp32_dev01",
    "name": "ESP32-esp32_dev01",
    "status": "online",
    "latestRisk": "HIGH",
    "latestRfValue": 2850,
    "lastSeen": "2026-11-12T09:14:55.120Z"
  }
}
```

---

### 4. Latest Device Telemetry
- **Endpoint:** `GET /api/devices/:deviceId/latest`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "6733230b80678d91a92e10c5",
    "deviceId": "esp32_dev01",
    "deviceTimestamp": "2026-11-12T09:14:55.000Z",
    "receivedAt": "2026-11-12T09:14:55.120Z",
    "rfValue": 2850,
    "rfAnomaly": true,
    "wifiNetworks": [
      { "ssid": "Home_WiFi", "suspicious": false },
      { "ssid": "spycam_device", "suspicious": true }
    ],
    "suspiciousSSID": true,
    "cameraButton": false,
    "riskLevel": "HIGH"
  }
}
```

---

### 5. Telemetry History
- **Endpoint:** `GET /api/telemetry`
- **Query Parameters:** `deviceId`, `riskLevel`, `anomaly`, `page`, `limit`
- **Response (200 OK):** Array of telemetry records with pagination metadata.

---

### 6. Ingest Telemetry (REST Fallback)
- **Endpoint:** `POST /api/telemetry`
- **Payload:**
```json
{
  "deviceId": "esp32_dev01",
  "timestamp": 1794474800,
  "rfValue": 2850,
  "wifiNetworks": [
    { "ssid": "Home_WiFi", "suspicious": false },
    { "ssid": "spycam_device", "suspicious": true }
  ],
  "cameraButton": false
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Telemetry ingested and processed successfully",
  "data": {
    "device": { ... },
    "telemetry": { ... },
    "alert": { ... },
    "riskChanged": true
  }
}
```

---

### 7. Alert History
- **Endpoint:** `GET /api/alerts`
- **Query Parameters:**
  - `deviceId` (optional)
  - `severity` (optional: `LOW`, `MEDIUM`, `HIGH`)
  - `acknowledged` (optional: `true`, `false`)
  - `page`, `limit`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6733230b80678d91a92e10e9",
      "deviceId": "esp32_dev01",
      "severity": "HIGH",
      "message": "CRITICAL: Elevated RF anomaly (2850) and suspicious hidden camera SSIDs detected (spycam_device)",
      "rfValue": 2850,
      "suspiciousSSIDs": ["spycam_device"],
      "acknowledged": false,
      "occurredAt": "2026-11-12T09:14:55.130Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

---

### 8. Acknowledge Alert
- **Endpoint:** `PATCH /api/alerts/:id/acknowledge`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Alert acknowledged successfully",
  "data": {
    "_id": "6733230b80678d91a92e10e9",
    "acknowledged": true
  }
}
```

