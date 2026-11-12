# Database Schema Specification
## MongoDB & Mongoose Design

The system utilizes three core collections within MongoDB:
- `devices`
- `telemetries`
- `alerts`

---

## 1. Devices Collection (`devices`)

Stores registered edge hardware nodes, their operational status, and cached risk states.

```javascript
{
  _id: ObjectId,
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    trim: true,
    default: "ESP32-{deviceId}"
  },
  status: {
    type: String,
    enum: ["online", "offline", "warning", "error"],
    default: "online",
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  latestRisk: {
    type: String,
    enum: ["SAFE", "LOW", "MEDIUM", "HIGH"],
    default: "SAFE",
    index: true
  },
  latestRfValue: {
    type: Number,
    default: 0
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes:
- `{ deviceId: 1 }` (unique)
- `{ status: 1, lastSeen: -1 }`

---

## 2. Telemetry Collection (`telemetries`)

High-frequency time-series record store of raw and assessed readings.

```javascript
{
  _id: ObjectId,
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  deviceTimestamp: {
    type: Date,
    default: Date.now
  },
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  rfValue: {
    type: Number,
    required: true,
    min: 0
  },
  rfAnomaly: {
    type: Boolean,
    required: true
  },
  wifiNetworks: [
    {
      ssid: String,
      suspicious: Boolean
    }
  ],
  suspiciousSSID: {
    type: Boolean,
    required: true
  },
  cameraButton: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    enum: ["SAFE", "LOW", "MEDIUM", "HIGH"],
    required: true,
    index: true
  }
}
```

### Indexes:
- `{ deviceId: 1, receivedAt: -1 }`
- `{ riskLevel: 1, receivedAt: -1 }`

---

## 3. Alerts Collection (`alerts`)

Stores security threat incidents, severity levels, and acknowledgment tracking.

```javascript
{
  _id: ObjectId,
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  rfValue: {
    type: Number,
    default: 0
  },
  suspiciousSSIDs: [String],
  acknowledged: {
    type: Boolean,
    default: false,
    index: true
  },
  occurredAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes:
- `{ deviceId: 1, occurredAt: -1 }`
- `{ acknowledged: 1, severity: 1, occurredAt: -1 }`

