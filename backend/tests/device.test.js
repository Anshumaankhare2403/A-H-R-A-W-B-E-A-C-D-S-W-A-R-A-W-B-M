import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase } from './setupDb.js';
import { Device } from '../src/models/Device.js';

describe('Device Model & Registration Suite', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 300000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it('TEST-009: automatically registers a new device when upsertOnTelemetry is called', async () => {
    const device = await Device.upsertOnTelemetry('device001', 1200, 'SAFE');
    expect(device).toBeDefined();
    expect(device.deviceId).toBe('device001');
    expect(device.name).toBe('Device-device001');
    expect(device.latestRfValue).toBe(1200);
    expect(device.latestRisk).toBe('SAFE');
    expect(device.status).toBe('ONLINE');
    expect(device.lastSeen).toBeInstanceOf(Date);
  });

  it('TEST-010: updates existing device with latest RF and Risk without creating duplicate', async () => {
    await Device.upsertOnTelemetry('device001', 1200, 'SAFE');

    const updated = await Device.upsertOnTelemetry('device001', 3500, 'HIGH');
    expect(updated.deviceId).toBe('device001');
    expect(updated.latestRfValue).toBe(3500);
    expect(updated.latestRisk).toBe('HIGH');
    expect(updated.status).toBe('ALERT');

    const count = await Device.countDocuments({ deviceId: 'device001' });
    expect(count).toBe(1);
  });

  it('sets appropriate device status based on riskLevel', async () => {
    const highDev = await Device.upsertOnTelemetry('dev_high', 3200, 'HIGH');
    expect(highDev.status).toBe('ALERT');

    const medDev = await Device.upsertOnTelemetry('dev_med', 2500, 'MEDIUM');
    expect(medDev.status).toBe('WARNING');

    const lowDev = await Device.upsertOnTelemetry('dev_low', 800, 'LOW');
    expect(lowDev.status).toBe('WARNING');

    const safeDev = await Device.upsertOnTelemetry('dev_safe', 500, 'SAFE');
    expect(safeDev.status).toBe('ONLINE');
  });

  it('enforces unique deviceId constraint', async () => {
    await Device.init();
    await Device.create({ deviceId: 'unique_01' });
    let error;
    try {
      await Device.create({ deviceId: 'unique_01' });
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });
});
