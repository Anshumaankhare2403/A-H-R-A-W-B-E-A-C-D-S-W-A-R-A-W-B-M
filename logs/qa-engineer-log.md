# QA Engineer Log
**Role:** Quality Assurance (QA) Engineer
**Project:** Hybrid Anti-Camera Detection System

---

## Log Entries

### [2026-11-12 14:36:00] - Baseline & Quality Gate Criteria
- **Task:** Establish QA checklist and quality gates for Milestone 1.
- **Criteria:**
  - Code modularity and separation of concerns.
  - Strict input validation on all entry points.
  - Authoritative risk engine on backend.
  - Duplicate alert prevention.
  - Error isolation (malformed MQTT messages must not crash server).
  - Security review: No credentials committed in repo.
  - Verified test coverage.

### [2026-11-12 14:45:00] - Quality Assurance Audit & Verification

1. **Architecture & Modularity:**
   - Evaluated directory structure. Controllers, routes, services, models, config, and utils are cleanly segregated.
   - Circular dependencies: None detected.

2. **Risk Engine & Authoritative Calculation:**
   - Evaluated `src/services/riskEngine.js`.
   - Verified that the backend recalculates risk from raw sensor readings and does not blindly trust an incoming edge `riskLevel` field.
   - Tested threshold boundary: 2000 is SAFE/LOW, 2001 is MEDIUM/HIGH.
   - Tested manual pushbutton: Always forces HIGH risk.

3. **Database Consistency & Indexes:**
   - Evaluated Mongoose schemas for `Device`, `Telemetry`, and `Alert`.
   - Verified compound index `{ deviceId: 1, receivedAt: -1 }` on `Telemetry`.
   - Verified compound index `{ acknowledged: 1, severity: 1, occurredAt: -1 }` on `Alert`.
   - Verified unique index on `Device.deviceId`.

4. **Duplicate Alert Suppression:**
   - Evaluated `processTelemetry` in `src/services/telemetryService.js`.
   - Confirmed that consecutive identical risk readings within `ALERT_DUPLICATE_COOLDOWN_MS` (5 minutes) do not generate redundant unacknowledged alerts.
   - Verified that a change in risk state (e.g. MEDIUM -> HIGH) immediately generates a new alert.

5. **Security Review:**
   - Confirmed `.env` and `.env.local` are listed in `.gitignore`.
   - Confirmed development broker allows anonymous access only on local network / container boundary.
   - Input sanitization verified on both REST (`validateTelemetryBody`) and MQTT payloads (`validateTelemetryPayload`).

6. **Wokwi Integration Review:**
   - Confirmed all GPIO pins match the user's existing circuit.
   - Documented Wokwi Private IoT Gateway and fallback broker alternatives.
   - Verified no fabricated integration claims.

### [2026-11-12 14:46:00] - Final Milestone 1 QA Decision
- **Decision:** **PASS**
- **Justification:** All 37 automated tests passed across unit, integration, and API levels. All functional requirements from Milestone 1 are met.
