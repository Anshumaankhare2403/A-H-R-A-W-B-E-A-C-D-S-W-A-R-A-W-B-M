import config from '../config/environment.js';

export function isSSIDSuspicious(ssid, keywords = config.risk.suspiciousKeywords) {
  if (!ssid || typeof ssid !== 'string') return false;
  const lowerSSID = ssid.toLowerCase();
  return keywords.some(keyword => lowerSSID.includes(keyword.toLowerCase()));
}

export function analyzeWiFiNetworks(networks = [], keywords = config.risk.suspiciousKeywords) {
  if (!Array.isArray(networks)) {
    return {
      hasSuspicious: false,
      suspiciousNetworks: [],
      annotatedNetworks: []
    };
  }

  const annotatedNetworks = [];
  const suspiciousNetworks = [];

  for (const item of networks) {
    let ssid = '';
    let flaggedFromDevice = false;

    if (typeof item === 'string') {
      ssid = item.trim();
    } else if (item && typeof item === 'object') {
      ssid = typeof item.ssid === 'string' ? item.ssid.trim() : '';
      flaggedFromDevice = Boolean(item.suspicious);
    }

    if (!ssid) continue;

    const matchesKeyword = isSSIDSuspicious(ssid, keywords);
    const isSuspicious = matchesKeyword || flaggedFromDevice;

    const record = { ssid, suspicious: isSuspicious };
    annotatedNetworks.push(record);

    if (isSuspicious) {
      suspiciousNetworks.push(record);
    }
  }

  return {
    hasSuspicious: suspiciousNetworks.length > 0,
    suspiciousNetworks,
    annotatedNetworks
  };
}

export function calculateRisk({
  rfValue = 0,
  wifiNetworks = [],
  cameraButton = false,
  customThreshold = null,
  customKeywords = null
}) {
  const numericRfValue = Number.isFinite(Number(rfValue)) ? Math.max(0, Number(rfValue)) : 0;
  const threshold = customThreshold !== null && customThreshold !== undefined
    ? Number(customThreshold)
    : config.risk.rfThreshold;

  const keywords = customKeywords || config.risk.suspiciousKeywords;

  const rfAnomaly = numericRfValue > threshold;
  const { hasSuspicious, suspiciousNetworks, annotatedNetworks } = analyzeWiFiNetworks(wifiNetworks, keywords);
  const suspiciousSSIDList = suspiciousNetworks.map(n => n.ssid);
  const isButtonPressed = Boolean(cameraButton);

  let riskLevel = 'SAFE';

  if (isButtonPressed) {
    riskLevel = 'HIGH';
  } else if (rfAnomaly && hasSuspicious) {
    riskLevel = 'HIGH';
  } else if (rfAnomaly && !hasSuspicious) {
    riskLevel = 'MEDIUM';
  } else if (!rfAnomaly && hasSuspicious) {
    riskLevel = 'LOW';
  } else {
    riskLevel = 'SAFE';
  }

  return {
    riskLevel,
    rfAnomaly,
    suspiciousSSID: hasSuspicious,
    suspiciousSSIDList,
    annotatedNetworks,
    cameraButton: isButtonPressed,
    rfValue: numericRfValue,
    thresholdUsed: threshold
  };
}

export default {
  calculateRisk,
  analyzeWiFiNetworks,
  isSSIDSuspicious
};
