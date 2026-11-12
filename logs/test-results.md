# Test Results Log
**Project:** Hybrid Anti-Camera Detection System
**Milestone:** 1 - Backend and Wokwi IoT Integration
**Execution Date:** 2026-11-12
**Total Tests:** 37 | **Passed:** 37 | **Failed:** 0 | **Blocked:** 0

---

| Test ID | Test Name | Module | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TST-001 | Risk Engine SAFE condition | Risk Engine | Returns SAFE when rfValue <= threshold, no suspicious SSIDs, camBtn=false | Returned SAFE with empty suspiciousNetworks | PASS |
| TST-002 | Risk Engine LOW condition | Risk Engine | Returns LOW when rfValue <= threshold, suspicious SSIDs present | Returned LOW with suspicious network identified | PASS |
| TST-003 | Risk Engine MEDIUM condition | Risk Engine | Returns MEDIUM when rfValue > threshold, no suspicious SSIDs | Returned MEDIUM with rfAnomaly=true | PASS |
| TST-004 | Risk Engine HIGH condition (RF + SSID) | Risk Engine | Returns HIGH when rfValue > threshold and suspicious SSIDs present | Returned HIGH with rfAnomaly=true & suspiciousSSID=true | PASS |
| TST-005 | Risk Engine Manual Button Override | Risk Engine | Returns HIGH whenever cameraButton is true regardless of RF/SSID | Returned HIGH on cameraButton=true | PASS |
| TST-006 | Risk Engine Threshold Boundary | Risk Engine | Exact threshold (2000) evaluates to rfAnomaly=false; 2001 evaluates to true | Correct boundary distinction at 2000 vs 2001 | PASS |
| TST-007 | Risk Engine Invalid RF Handling | Risk Engine | Defaults gracefully on invalid/negative/non-numeric RF | Handled null, string, negative, and NaN safely | PASS |
| TST-008 | Database Device Auto-Registration | Telemetry Service | Registers new device on first telemetry arrival | Auto-created device record with status 'online' | PASS |
| TST-009 | Database Device State Update | Telemetry Service | Updates lastSeen, latestRisk, latestRfValue on existing device | Updated device fields correctly | PASS |
| TST-010 | Database Telemetry Storage | Telemetry Service | Persists complete telemetry record with calculated risk and timestamp | Stored full telemetry history in MongoDB | PASS |
| TST-011 | Alert Generation on Non-SAFE Entry | Telemetry Service | Generates alert when risk state transitions to LOW/MEDIUM/HIGH | Created Alert record with severity HIGH | PASS |
| TST-012 | Duplicate Alert Suppression | Telemetry Service | Does not generate redundant alert on consecutive identical risk readings | Suppressed duplicate alert on 2nd reading | PASS |
| TST-013 | REST Health Check Endpoint | REST API | GET /api/health returns 200 and system health status | Returned 200 with database status 'connected' | PASS |
| TST-014 | REST List Devices Endpoint | REST API | GET /api/devices returns device list with pagination | Returned 200 with device array and pagination | PASS |
| TST-015 | REST Single Device Details | REST API | GET /api/devices/:deviceId returns single device | Returned 200 with requested device object | PASS |
| TST-016 | REST Latest Device Telemetry | REST API | GET /api/devices/:deviceId/latest returns most recent record | Returned 200 with latest telemetry document | PASS |
| TST-017 | REST Telemetry History & Filter | REST API | GET /api/telemetry returns historical records with filters | Returned 200 with filtered telemetry records | PASS |
| TST-018 | REST Alert History & Pagination | REST API | GET /api/alerts returns alerts with pagination | Returned 200 with alert records | PASS |
| TST-019 | REST Alert Acknowledgment | REST API | PATCH /api/alerts/:id/acknowledge updates acknowledged to true | Updated acknowledged field to true | PASS |
| TST-020 | Socket.IO Real-time Broadcasts | Sockets | Emits device:telemetry, risk:changed, alert:high-risk | Received all WebSocket events on client | PASS |
| TST-021 | MQTT Ingestion & Malformed JSON | MQTT Service | Gracefully handles corrupted JSON without crashing backend | Discarded corrupted JSON, backend continued running | PASS |
