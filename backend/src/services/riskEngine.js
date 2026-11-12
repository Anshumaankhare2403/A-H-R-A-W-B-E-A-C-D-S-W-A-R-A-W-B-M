import config from '../config/environment.js';

export const SUSPICIOUS_KEYWORDS = [
  'spycam',
  'camera',
  'hidden',
  'surveillance',
  'monitor'
];

/**
 * Checks if a Wi-Fi network SSID contains any suspicious hidden camera keywords.
 * @param {string} ssid
 * @returns {boolean}
 */
export function isSsidSuspicious(ssid) {
  if (!ssid || typeof ssid !== 'string') return false;
  const lower = ssid.toLowerCase();
  return SUSPICIOUS_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Authoritative Risk Analysis Engine
 * Calculates risk level based on RF signal anomaly, suspicious Wi-Fi SSIDs, and manual camera button.
 *
 * @param {Object} params
 * @param {number|string} params.rfValue - Current RF sensor reading
 * @param {Array} [params.wifiNetworks=[]] - List of detected Wi-Fi networks ({ ssid, suspicious }) or string SSIDs
 * @param {boolean} [params.cameraButton=false] - Manual camera detection push-button state
 * @param {number} [threshold] - Optional override threshold; defaults to environment RF_THRESHOLD or 2000
 * @returns {{ rfAnomaly: boolean, suspiciousSSID: boolean, riskLevel: 'SAFE'|'LOW'|'MEDIUM'|'HIGH', suspiciousNetworks: string[] }}
 */
export function calculateRisk(
  {
    rfValue,
    wifiNetworks = [],
    cameraButton = false
  } = {},
  threshold = config?.rfThreshold || 2000
) {
  // Validate and parse RF value
  const parsedRf = Number(rfValue);
  const validRf = !isNaN(parsedRf) && parsedRf >= 0 ? parsedRf : 0;
  const rfAnomaly = validRf > threshold;

  // Evaluate suspicious Wi-Fi SSIDs
  const networks = Array.isArray(wifiNetworks) ? wifiNetworks : [];
  const suspiciousNetworks = [];

  for (const net of networks) {
    if (!net) continue;
    if (typeof net === 'string') {
      if (isSsidSuspicious(net)) {
        suspiciousNetworks.push(net);
      }
    } else if (typeof net === 'object') {
      const ssidStr = typeof net.ssid === 'string' ? net.ssid : '';
      const isSusp = net.suspicious === true || isSsidSuspicious(ssidStr);
      if (isSusp && ssidStr) {
        suspiciousNetworks.push(ssidStr);
      }
    }
  }

  const suspiciousSSID = suspiciousNetworks.length > 0;
  const manualButtonTriggered = Boolean(cameraButton);

  let riskLevel = 'SAFE';

  if (manualButtonTriggered) {
    riskLevel = 'HIGH';
  } else if (rfAnomaly && suspiciousSSID) {
    riskLevel = 'HIGH';
  } else if (rfAnomaly) {
    riskLevel = 'MEDIUM';
  } else if (suspiciousSSID) {
    riskLevel = 'LOW';
  }

  return {
    rfAnomaly,
    suspiciousSSID,
    riskLevel,
    suspiciousNetworks
  };
}

export default {
  calculateRisk,
  isSsidSuspicious,
  SUSPICIOUS_KEYWORDS
};

