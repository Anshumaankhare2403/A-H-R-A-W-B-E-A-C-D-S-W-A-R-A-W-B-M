import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateRisk, isSsidSuspicious, SUSPICIOUS_KEYWORDS } from '../src/services/riskEngine.js';

describe('Risk Analysis Engine Unit Tests', () => {
  const DEFAULT_THRESHOLD = 2000;

  describe('Keyword Detection - isSsidSuspicious', () => {
    it('should detect suspicious keywords correctly', () => {
      SUSPICIOUS_KEYWORDS.forEach((kw) => {
        assert.equal(isSsidSuspicious(`My_${kw}_Network`), true);
        assert.equal(isSsidSuspicious(kw.toUpperCase()), true);
      });
    });

    it('should return false for benign SSIDs', () => {
      assert.equal(isSsidSuspicious('Home_WiFi'), false);
      assert.equal(isSsidSuspicious('OfficeNet_5G'), false);
      assert.equal(isSsidSuspicious('Guest_Hotspot'), false);
    });

    it('should handle null, undefined, and non-string inputs safely', () => {
      assert.equal(isSsidSuspicious(null), false);
      assert.equal(isSsidSuspicious(undefined), false);
      assert.equal(isSsidSuspicious(12345), false);
      assert.equal(isSsidSuspicious(''), false);
    });
  });

  describe('calculateRisk Matrix', () => {
    it('Condition 1 (SAFE): rfAnomaly=No, suspiciousSSID=No, cameraButton=No', () => {
      const result = calculateRisk({
        rfValue: 1200,
        wifiNetworks: [{ ssid: 'Home_WiFi', suspicious: false }],
        cameraButton: false
      }, DEFAULT_THRESHOLD);

      assert.equal(result.rfAnomaly, false);
      assert.equal(result.suspiciousSSID, false);
      assert.equal(result.riskLevel, 'SAFE');
      assert.deepEqual(result.suspiciousNetworks, []);
    });

    it('Condition 2 (LOW): rfAnomaly=No, suspiciousSSID=Yes, cameraButton=No', () => {
      const result = calculateRisk({
        rfValue: 1500,
        wifiNetworks: [
          { ssid: 'Home_WiFi', suspicious: false },
          { ssid: 'spycam_device', suspicious: true }
        ],
        cameraButton: false
      }, DEFAULT_THRESHOLD);

      assert.equal(result.rfAnomaly, false);
      assert.equal(result.suspiciousSSID, true);
      assert.equal(result.riskLevel, 'LOW');
      assert.ok(result.suspiciousNetworks.includes('spycam_device'));
    });

    it('Condition 3 (MEDIUM): rfAnomaly=Yes, suspiciousSSID=No, cameraButton=No', () => {
      const result = calculateRisk({
        rfValue: 2800,
        wifiNetworks: [{ ssid: 'Home_WiFi', suspicious: false }],
        cameraButton: false
      }, DEFAULT_THRESHOLD);

      assert.equal(result.rfAnomaly, true);
      assert.equal(result.suspiciousSSID, false);
      assert.equal(result.riskLevel, 'MEDIUM');
    });

    it('Condition 4 (HIGH): rfAnomaly=Yes, suspiciousSSID=Yes, cameraButton=No', () => {
      const result = calculateRisk({
        rfValue: 3200,
        wifiNetworks: [
          { ssid: 'Home_WiFi', suspicious: false },
          { ssid: 'hidden_cam_01', suspicious: true }
        ],
        cameraButton: false
      }, DEFAULT_THRESHOLD);

      assert.equal(result.rfAnomaly, true);
      assert.equal(result.suspiciousSSID, true);
      assert.equal(result.riskLevel, 'HIGH');
      assert.ok(result.suspiciousNetworks.includes('hidden_cam_01'));
    });

    it('Condition 5 (HIGH - Manual Override): cameraButton=Yes with low RF and no suspicious SSIDs', () => {
      const result = calculateRisk({
        rfValue: 500,
        wifiNetworks: [{ ssid: 'Home_WiFi', suspicious: false }],
        cameraButton: true
      }, DEFAULT_THRESHOLD);

      assert.equal(result.rfAnomaly, false);
      assert.equal(result.suspiciousSSID, false);
      assert.equal(result.riskLevel, 'HIGH');
    });

    it('Condition 5b (HIGH - Manual Override): cameraButton=Yes overrides all other combinations', () => {
      const result = calculateRisk({
        rfValue: 4000,
        wifiNetworks: [{ ssid: 'surveillance_node', suspicious: true }],
        cameraButton: true
      }, DEFAULT_THRESHOLD);

      assert.equal(result.rfAnomaly, true);
      assert.equal(result.suspiciousSSID, true);
      assert.equal(result.riskLevel, 'HIGH');
    });
  });

  describe('Boundary and Edge Cases', () => {
    it('Boundary check: rfValue exactly at threshold (2000) is NOT an anomaly', () => {
      const result = calculateRisk({
        rfValue: 2000,
        wifiNetworks: [],
        cameraButton: false
      }, 2000);

      assert.equal(result.rfAnomaly, false);
      assert.equal(result.riskLevel, 'SAFE');
    });

    it('Boundary check: rfValue at 2001 is an anomaly', () => {
      const result = calculateRisk({
        rfValue: 2001,
        wifiNetworks: [],
        cameraButton: false
      }, 2000);

      assert.equal(result.rfAnomaly, true);
      assert.equal(result.riskLevel, 'MEDIUM');
    });

    it('Handles empty or omitted parameters safely', () => {
      const result = calculateRisk();
      assert.equal(result.rfAnomaly, false);
      assert.equal(result.suspiciousSSID, false);
      assert.equal(result.riskLevel, 'SAFE');
      assert.deepEqual(result.suspiciousNetworks, []);
    });

    it('Handles non-numeric or negative rfValue without throwing', () => {
      const invalidVals = ['invalid_string', null, undefined, -500, NaN];
      invalidVals.forEach((val) => {
        const result = calculateRisk({ rfValue: val });
        assert.equal(result.riskLevel, 'SAFE');
      });
    });

    it('Auto-detects suspicious SSID strings when suspicious boolean flag is omitted or false', () => {
      const result = calculateRisk({
        rfValue: 800,
        wifiNetworks: [
          { ssid: 'office_spycam_hd' }
        ],
        cameraButton: false
      });

      assert.equal(result.suspiciousSSID, true);
      assert.equal(result.riskLevel, 'LOW');
      assert.ok(result.suspiciousNetworks.includes('office_spycam_hd'));
    });

    it('Supports array of string SSIDs', () => {
      const result = calculateRisk({
        rfValue: 800,
        wifiNetworks: ['Home', 'hidden_camera_99'],
        cameraButton: false
      });

      assert.equal(result.suspiciousSSID, true);
      assert.equal(result.riskLevel, 'LOW');
      assert.ok(result.suspiciousNetworks.includes('hidden_camera_99'));
    });
  });
});
