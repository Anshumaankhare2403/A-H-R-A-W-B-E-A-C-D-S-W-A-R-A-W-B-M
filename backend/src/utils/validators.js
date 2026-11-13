export function validateTelemetryPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { isValid: false, error: 'Payload must be a valid JSON object' };
  }

  if (!payload.deviceId || typeof payload.deviceId !== 'string' || !payload.deviceId.trim()) {
    return { isValid: false, error: 'Field "deviceId" is required and must be a non-empty string' };
  }
  const deviceId = payload.deviceId.trim();

  let timestamp = Number(payload.timestamp);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    timestamp = Math.floor(Date.now() / 1000);
  }

  if (payload.rfValue === undefined || payload.rfValue === null) {
    return { isValid: false, error: 'Field "rfValue" is required' };
  }
  const rfValue = Number(payload.rfValue);
  if (!Number.isFinite(rfValue) || rfValue < 0) {
    return { isValid: false, error: 'Field "rfValue" must be a non-negative number' };
  }

  let wifiNetworks = [];
  if (payload.wifiNetworks !== undefined && payload.wifiNetworks !== null) {
    if (!Array.isArray(payload.wifiNetworks)) {
      return { isValid: false, error: 'Field "wifiNetworks" must be an array' };
    }
    wifiNetworks = payload.wifiNetworks;
  }

  const cameraButton = Boolean(payload.cameraButton);

  return {
    isValid: true,
    sanitized: {
      deviceId,
      timestamp,
      rfValue,
      wifiNetworks,
      cameraButton
    }
  };
}

export default { validateTelemetryPayload };
