import { Device } from '../models/Device.js';
import { Telemetry } from '../models/Telemetry.js';
import { Alert } from '../models/Alert.js';
import { calculateRisk } from './riskEngine.js';
import { validateTelemetryPayload } from '../utils/validators.js';
import {
  emitTelemetry,
  emitDeviceStatus,
  emitRiskChanged,
  emitAlert
} from '../sockets/socketHandler.js';

function buildAlertMessage(deviceId, riskLevel, rfAnomaly, rfValue, suspiciousSSIDList, cameraButton) {
  if (cameraButton) {
    return `[CRITICAL] Manual camera alert triggered on device ${deviceId} (RF: ${rfValue}).`;
  }
  if (riskLevel === 'HIGH') {
    return `[HIGH RISK] Suspicious RF anomaly (${rfValue}) AND suspicious Wi-Fi detected (${suspiciousSSIDList.join(', ')}) on ${deviceId}.`;
  }
  if (riskLevel === 'MEDIUM') {
    return `[MEDIUM RISK] Elevated RF signal anomaly detected (${rfValue}) on ${deviceId}.`;
  }
  if (riskLevel === 'LOW') {
    return `[LOW RISK] Suspicious Wi-Fi network SSID detected (${suspiciousSSIDList.join(', ')}) on ${deviceId}.`;
  }
  return `Normal operation on ${deviceId}.`;
}

export async function processTelemetry(rawPayload) {
  const validation = validateTelemetryPayload(rawPayload);
  if (!validation.isValid) {
    console.warn(`[TelemetryService] Rejected invalid telemetry payload: ${validation.error}`);
    return { success: false, error: validation.error };
  }

  const { deviceId, timestamp, rfValue, wifiNetworks, cameraButton } = validation.sanitized;

  const riskAnalysis = calculateRisk({
    rfValue,
    wifiNetworks,
    cameraButton
  });

  const { riskLevel, rfAnomaly, suspiciousSSID, suspiciousSSIDList, annotatedNetworks } = riskAnalysis;

  const existingDevice = await Device.findOne({ deviceId });
  const previousRisk = existingDevice ? existingDevice.latestRisk : null;
  const isFirstSeen = !existingDevice;

  const telemetryDoc = await Telemetry.create({
    deviceId,
    deviceTimestamp: timestamp,
    rfValue,
    rfAnomaly,
    wifiNetworks: annotatedNetworks,
    suspiciousSSID,
    suspiciousSSIDList,
    cameraButton,
    riskLevel
  });

  const updatedDevice = await Device.upsertOnTelemetry(deviceId, rfValue, riskLevel);

  let createdAlert = null;
  const isNonSafe = riskLevel !== 'SAFE';

  if (isNonSafe) {
    const riskChanged = previousRisk !== riskLevel;

    const existingActiveAlert = await Alert.findOne({
      deviceId,
      severity: riskLevel,
      acknowledged: false
    }).sort({ occurredAt: -1 });

    const shouldCreateAlert = riskChanged || cameraButton || !existingActiveAlert || isFirstSeen;

    if (shouldCreateAlert) {
      const alertMessage = buildAlertMessage(
        deviceId,
        riskLevel,
        rfAnomaly,
        rfValue,
        suspiciousSSIDList,
        cameraButton
      );

      createdAlert = await Alert.create({
        deviceId,
        severity: riskLevel,
        message: alertMessage,
        rfValue,
        suspiciousSSIDs: suspiciousSSIDList,
        cameraButton,
        acknowledged: false
      });

      console.log(`[TelemetryService] New Alert created for ${deviceId} [Severity: ${riskLevel}]: ${alertMessage}`);
      emitAlert(createdAlert);
    } else {
      console.log(`[TelemetryService] Duplicate alert suppressed for ${deviceId} (Risk remaining unchanged at ${riskLevel})`);
    }
  }

  emitTelemetry(telemetryDoc);
  emitDeviceStatus(updatedDevice);

  if (previousRisk && previousRisk !== riskLevel) {
    emitRiskChanged({
      deviceId,
      previousRisk,
      newRisk: riskLevel,
      rfValue,
      timestamp: new Date()
    });
  }

  return {
    success: true,
    telemetry: telemetryDoc,
    device: updatedDevice,
    alert: createdAlert
  };
}

export default { processTelemetry };
