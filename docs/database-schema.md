# Database Schema
Collections:
- devices (deviceId, name, status, latestRisk, latestRfValue, lastSeen)
- telemetries (deviceId, deviceTimestamp, rfValue, rfAnomaly, wifiNetworks, suspiciousSSID, cameraButton, riskLevel)
- alerts (deviceId, severity, message, rfValue, suspiciousSSIDs, cameraButton, acknowledged, acknowledgedAt, occurredAt)
- users (username, email, role, isActive)
