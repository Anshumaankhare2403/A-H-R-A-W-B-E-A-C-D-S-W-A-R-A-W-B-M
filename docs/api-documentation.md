# REST API Documentation
Base URL: `http://localhost:5000`

Endpoints:
- GET /api/health
- GET /api/devices (pagination, status, risk filters)
- GET /api/devices/:deviceId
- GET /api/devices/:deviceId/latest
- GET /api/telemetry (pagination, deviceId, riskLevel, date filters)
- GET /api/telemetry/:deviceId
- POST /api/telemetry
- GET /api/alerts (severity, acknowledged filters)
- PATCH /api/alerts/:id/acknowledge
