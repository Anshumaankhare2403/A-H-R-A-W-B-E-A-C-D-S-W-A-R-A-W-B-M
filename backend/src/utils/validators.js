/**
 * Validates incoming telemetry payload format and field types.
 *
 * @param {Object} payload
 * @returns {{ valid: boolean, error?: string, sanitized?: Object }}
 */
export function validateTelemetryPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, error: 'Telemetry payload must be a non-null JSON object' };
  }

  const { deviceId, timestamp, rfValue, wifiNetworks, cameraButton } = payload;

  if (!deviceId || typeof deviceId !== 'string' || !deviceId.trim()) {
    return { valid: false, error: 'Missing or invalid "deviceId" (string required)' };
  }

  const parsedRf = Number(rfValue);
  if (rfValue === undefined || rfValue === null || isNaN(parsedRf) || parsedRf < 0) {
    return { valid: false, error: 'Missing or invalid "rfValue" (non-negative number required)' };
  }

  // Parse device timestamp (epoch seconds or milliseconds or ISO string)
  let parsedTimestamp = new Date();
  if (timestamp) {
    if (typeof timestamp === 'number') {
      // If seconds (10 digits), convert to ms
      parsedTimestamp = new Date(timestamp < 1e11 ? timestamp * 1000 : timestamp);
    } else {
      const parsedDate = new Date(timestamp);
      if (!isNaN(parsedDate.getTime())) {
        parsedTimestamp = parsedDate;
      }
    }
  }

  // Normalize wifiNetworks
  const sanitizedNetworks = [];
  if (Array.isArray(wifiNetworks)) {
    for (const net of wifiNetworks) {
      if (!net) continue;
      if (typeof net === 'string') {
        sanitizedNetworks.push({ ssid: net.trim(), suspicious: false });
      } else if (typeof net === 'object' && net.ssid && typeof net.ssid === 'string') {
        sanitizedNetworks.push({
          ssid: net.ssid.trim(),
          suspicious: Boolean(net.suspicious)
        });
      }
    }
  }

  return {
    valid: true,
    sanitized: {
      deviceId: deviceId.trim(),
      deviceTimestamp: parsedTimestamp,
      rfValue: parsedRf,
      wifiNetworks: sanitizedNetworks,
      cameraButton: Boolean(cameraButton)
    }
  };
}

export default {
  validateTelemetryPayload
};

