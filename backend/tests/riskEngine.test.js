import { describe, it, expect } from 'vitest';
import { calculateRisk, isSSIDSuspicious, analyzeWiFiNetworks } from '../src/services/riskEngine.js';

describe('Risk Analysis Engine Service', () => {
  const defaultKeywords = ['spycam', 'camera', 'hidden', 'surveillance', 'monitor'];
  const defaultThreshold = 2000;

  describe('isSSIDSuspicious keyword detection', () => {
    it('detects suspicious keywords case-insensitively', () => {
      expect(isSSIDSuspicious('SpyCam_Office', defaultKeywords)).toBe(true);
      expect(isSSIDSuspicious('HIDDEN_CAM_01', defaultKeywords)).toBe(true);
      expect(isSSIDSuspicious('living_room_camera', defaultKeywords)).toBe(true);
      expect(isSSIDSuspicious('Surveillance-Net', defaultKeywords)).toBe(true);
      expect(isSSIDSuspicious('baby-monitor-5g', defaultKeywords)).toBe(true);
    });

    it('returns false for normal benign SSIDs', () => {
      expect(isSSIDSuspicious('Home_WiFi', defaultKeywords)).toBe(false);
      expect(isSSIDSuspicious('Starbucks_Guest', defaultKeywords)).toBe(false);
      expect(isSSIDSuspicious('TP-Link_5G_Extender', defaultKeywords)).toBe(false);
    });

    it('handles empty, null, or undefined inputs gracefully', () => {
      expect(isSSIDSuspicious('', defaultKeywords)).toBe(false);
      expect(isSSIDSuspicious(null, defaultKeywords)).toBe(false);
      expect(isSSIDSuspicious(undefined, defaultKeywords)).toBe(false);
    });
  });

  describe('analyzeWiFiNetworks', () => {
    it('accurately identifies suspicious networks among regular ones', () => {
      const networks = [
        'Home_WiFi',
        'OfficeNet',
        'spycam_device',
        'GuestWiFi'
      ];
      const result = analyzeWiFiNetworks(networks, defaultKeywords);
      expect(result.hasSuspicious).toBe(true);
      expect(result.suspiciousNetworks).toHaveLength(1);
      expect(result.suspiciousNetworks[0].ssid).toBe('spycam_device');
      expect(result.annotatedNetworks).toHaveLength(4);
    });

    it('handles structured object networks with device-flagged state', () => {
      const networks = [
        { ssid: 'Home_WiFi', suspicious: false },
        { ssid: 'custom_covert_cam', suspicious: true }
      ];
      const result = analyzeWiFiNetworks(networks, defaultKeywords);
      expect(result.hasSuspicious).toBe(true);
      expect(result.suspiciousNetworks).toHaveLength(1);
      expect(result.suspiciousNetworks[0].ssid).toBe('custom_covert_cam');
    });

    it('handles empty or non-array networks input', () => {
      expect(analyzeWiFiNetworks([], defaultKeywords).hasSuspicious).toBe(false);
      expect(analyzeWiFiNetworks(null, defaultKeywords).hasSuspicious).toBe(false);
      expect(analyzeWiFiNetworks(undefined, defaultKeywords).hasSuspicious).toBe(false);
    });
  });

  describe('calculateRisk classification truth table', () => {
    it('evaluates SAFE condition (No RF, No SSID, No Button)', () => {
      const result = calculateRisk({
        rfValue: 1200,
        wifiNetworks: ['Home_WiFi', 'Guest_Net'],
        cameraButton: false,
        customThreshold: defaultThreshold
      });

      expect(result.riskLevel).toBe('SAFE');
      expect(result.rfAnomaly).toBe(false);
      expect(result.suspiciousSSID).toBe(false);
      expect(result.cameraButton).toBe(false);
    });

    it('evaluates LOW condition (No RF, Yes SSID, No Button)', () => {
      const result = calculateRisk({
        rfValue: 800,
        wifiNetworks: ['Home_WiFi', 'spycam_device'],
        cameraButton: false,
        customThreshold: defaultThreshold
      });

      expect(result.riskLevel).toBe('LOW');
      expect(result.rfAnomaly).toBe(false);
      expect(result.suspiciousSSID).toBe(true);
      expect(result.suspiciousSSIDList).toContain('spycam_device');
      expect(result.cameraButton).toBe(false);
    });

    it('evaluates MEDIUM condition (Yes RF, No SSID, No Button)', () => {
      const result = calculateRisk({
        rfValue: 2800,
        wifiNetworks: ['Home_WiFi', 'OfficeNet'],
        cameraButton: false,
        customThreshold: defaultThreshold
      });

      expect(result.riskLevel).toBe('MEDIUM');
      expect(result.rfAnomaly).toBe(true);
      expect(result.suspiciousSSID).toBe(false);
      expect(result.cameraButton).toBe(false);
    });

    it('evaluates HIGH condition (Yes RF, Yes SSID, No Button)', () => {
      const result = calculateRisk({
        rfValue: 3400,
        wifiNetworks: ['Home_WiFi', 'spycam_device'],
        cameraButton: false,
        customThreshold: defaultThreshold
      });

      expect(result.riskLevel).toBe('HIGH');
      expect(result.rfAnomaly).toBe(true);
      expect(result.suspiciousSSID).toBe(true);
      expect(result.cameraButton).toBe(false);
    });

    it('evaluates HIGH condition when manual button is pressed (Override)', () => {
      const result = calculateRisk({
        rfValue: 300,
        wifiNetworks: ['Home_WiFi'],
        cameraButton: true,
        customThreshold: defaultThreshold
      });

      expect(result.riskLevel).toBe('HIGH');
      expect(result.cameraButton).toBe(true);
      expect(result.rfAnomaly).toBe(false);
      expect(result.suspiciousSSID).toBe(false);
    });

    it('respects the exact threshold boundary (2000)', () => {
      const atThreshold = calculateRisk({
        rfValue: 2000,
        wifiNetworks: [],
        cameraButton: false,
        customThreshold: 2000
      });
      expect(atThreshold.rfAnomaly).toBe(false);
      expect(atThreshold.riskLevel).toBe('SAFE');

      const aboveThreshold = calculateRisk({
        rfValue: 2001,
        wifiNetworks: [],
        cameraButton: false,
        customThreshold: 2000
      });
      expect(aboveThreshold.rfAnomaly).toBe(true);
      expect(aboveThreshold.riskLevel).toBe('MEDIUM');
    });

    it('handles negative or invalid RF input cleanly', () => {
      const result = calculateRisk({
        rfValue: -50,
        wifiNetworks: [],
        cameraButton: false
      });
      expect(result.rfValue).toBe(0);
      expect(result.rfAnomaly).toBe(false);
    });
  });
});
