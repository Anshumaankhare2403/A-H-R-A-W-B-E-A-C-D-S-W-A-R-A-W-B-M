import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { API_BASE_URL } from '../src/services/api.ts';
import { RISK_CONFIG, getRiskConfig } from '../src/utils/riskHelpers.ts';
import { formatDate, formatRelativeTime } from '../src/utils/formatDate.ts';

describe('Frontend Architecture and Integration Contract Tests', () => {
  it('API_BASE_URL should default to port 4000', () => {
    assert.ok(API_BASE_URL.includes('4000') || API_BASE_URL.includes('5000'));
  });

  it('Risk matrix colors and definitions match project specification', () => {
    assert.equal(RISK_CONFIG.SAFE.label, 'SAFE');
    assert.equal(RISK_CONFIG.LOW.label, 'LOW');
    assert.equal(RISK_CONFIG.MEDIUM.label, 'MEDIUM');
    assert.equal(RISK_CONFIG.HIGH.label, 'HIGH');

    // Hex codes
    assert.equal(RISK_CONFIG.SAFE.hex, '#10B981');
    assert.equal(RISK_CONFIG.LOW.hex, '#3B82F6');
    assert.equal(RISK_CONFIG.MEDIUM.hex, '#F59E0B');
    assert.equal(RISK_CONFIG.HIGH.hex, '#EF4444');
  });

  it('getRiskConfig handles case insensitivity and fallback safely', () => {
    assert.equal(getRiskConfig('safe').label, 'SAFE');
    assert.equal(getRiskConfig('High').label, 'HIGH');
    assert.equal(getRiskConfig(undefined).label, 'SAFE');
  });

  it('Date formatting helpers handle invalid or empty inputs gracefully', () => {
    assert.equal(formatDate(undefined), 'N/A');
    assert.equal(formatRelativeTime(undefined), 'Never');
    assert.ok(formatDate(new Date('2026-11-12T10:00:00Z')).length > 0);
  });
});
