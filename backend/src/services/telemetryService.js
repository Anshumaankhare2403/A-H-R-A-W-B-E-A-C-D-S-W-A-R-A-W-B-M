import Device from '../models/Device.js';
import Telemetry from '../models/Telemetry.js';
import Alert from '../models/Alert.js';
import { calculateRisk } from './riskEngine.js';
import { validateTelemetryPayload } from '../utils/validators.js';
import {
  broadcastTelemetry,
  broadcastStatus,
  broadcastRiskChanged,
  broadcastAlert
} from '../sockets/socketHandler.js';

// Cooldown window in ms for duplicate identical alerts (e.g., 5 minutes)
const ALERT_DUPLICATE_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Ingestion and processing service for incoming ESP32 telemetry.
 *
 * @param {Object} rawPayload - Raw incoming message from MQTT or REST API
 * @returns {Promise<Object>} Processed records
 */
export async function processTelemetry(rawPayload) {
  // 1. Validate payload
  const validation = validateTelemetryPayload(rawPayload);
  if (!validation.valid) {
    const error = new Error(`Telemetry validation failed: ${validation.error}`);
    error.statusCode = 400;
    throw error;
  }

  const { deviceId, deviceTimestamp, rfValue, wifiNetworks, cameraButton } = validation.sanitized;

  // 2. Authoritative Risk Calculation
  const riskResult = calculateRisk({
    rfValue,
    wifiNetworks,
    cameraButton
  });

  const { rfAnomaly, suspiciousSSID, riskLevel, suspiciousNetworks } = riskResult;

  // 3. Register or Update Device Record
  let device = await Device.findOne({ deviceId });
  let previousRisk = 'SAFE';
  let isNewDevice = false;

  if (!device) {
    isNewDevice = true;
    device = new Device({
      deviceId,
      name: `ESP32-${deviceId}`,
      status: 'online',
      lastSeen: new Date(),
      latestRisk: riskLevel,
      latestRfValue: rfValue
    });
  } else {
    previousRisk = device.latestRisk;
    device.status = 'online';
    device.lastSeen = new Date();
    device.latestRisk = riskLevel;
    device.latestRfValue = rfValue;
  }

  await device.save();

  // 4. Persist Telemetry History Record
  const telemetryDoc = new Telemetry({
    deviceId,
    deviceTimestamp,
    receivedAt: new Date(),
    rfValue,
    rfAnomaly,
    wifiNetworks,
    suspiciousSSID,
    cameraButton,
    riskLevel
  });

  await telemetryDoc.save();

  // 5. Alert Generation with Duplicate Suppression
  let createdAlert = null;
  const isNonSafe = riskLevel !== 'SAFE';
  const riskChanged = previousRisk !== riskLevel;

  if (isNonSafe) {
    // Check if an unacknowledged alert of identical severity exists within cooldown
    const cooldownCutoff = new Date(Date.now() - ALERT_DUPLICATE_COOLDOWN_MS);
    const existingRecentAlert = await Alert.findOne({
      deviceId,
      severity: riskLevel,
      acknowledged: false,
      occurredAt: { $gte: cooldownCutoff }
    }).sort({ occurredAt: -1 });

    const shouldCreateAlert = cameraButton || riskChanged || !existingRecentAlert;

    if (shouldCreateAlert) {
      let alertMsg = `Risk condition detected: ${riskLevel}`;
      if (cameraButton) {
        alertMsg = 'Manual camera detection button triggered by user';
      } else if (riskLevel === 'HIGH') {
        alertMsg = `CRITICAL: Elevated RF anomaly (${rfValue}) and suspicious hidden camera SSIDs detected (${suspiciousNetworks.join(', ')})`;
      } else if (riskLevel === 'MEDIUM') {
        alertMsg = `WARNING: Elevated RF signal anomaly detected (${rfValue})`;
      } else if (riskLevel === 'LOW') {
        alertMsg = `NOTICE: Suspicious hidden camera Wi-Fi SSID(s) detected (${suspiciousNetworks.join(', ')})`;
      }

      createdAlert = new Alert({
        deviceId,
        severity: riskLevel,
        message: alertMsg,
        rfValue,
        suspiciousSSIDs: suspiciousNetworks,
        acknowledged: false,
        occurredAt: new Date()
      });

      await createdAlert.save();
      broadcastAlert(createdAlert.toObject());
    }
  }

  // 6. Broadcast Real-time Events
  broadcastTelemetry(telemetryDoc.toObject());
  broadcastStatus(device.toObject());

  if (riskChanged) {
    broadcastRiskChanged({
      deviceId,
      previousRisk,
      newRisk: riskLevel,
      rfValue,
      timestamp: new Date()
    });
  }

  return {
    success: true,
    isNewDevice,
    device: device.toObject(),
    telemetry: telemetryDoc.toObject(),
    alert: createdAlert ? createdAlert.toObject() : null,
    riskChanged
  };
}

export default {
  processTelemetry,
  ALERT_DUPLICATE_COOLDOWN_MS
};

