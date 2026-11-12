import Telemetry from '../models/Telemetry.js';
import { processTelemetry } from '../services/telemetryService.js';

export async function getTelemetry(req, res, next) {
  try {
    const { page, limit } = req.pagination;
    const { deviceId, riskLevel, anomaly } = req.query;

    const filter = {};
    if (deviceId) filter.deviceId = deviceId;
    if (riskLevel) filter.riskLevel = riskLevel.toUpperCase();
    if (anomaly !== undefined) filter.rfAnomaly = anomaly === 'true';

    const skip = (page - 1) * limit;
    const [telemetry, total] = await Promise.all([
      Telemetry.find(filter).sort({ receivedAt: -1 }).skip(skip).limit(limit),
      Telemetry.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: telemetry,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeviceTelemetry(req, res, next) {
  try {
    const { page, limit } = req.pagination;
    const { deviceId } = req.params;

    const filter = { deviceId };
    const skip = (page - 1) * limit;

    const [telemetry, total] = await Promise.all([
      Telemetry.find(filter).sort({ receivedAt: -1 }).skip(skip).limit(limit),
      Telemetry.countDocuments(filter)
    ]);

    res.json({
      success: true,
      deviceId,
      data: telemetry,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createTelemetry(req, res, next) {
  try {
    const result = await processTelemetry(req.body);
    res.status(201).json({
      success: true,
      message: 'Telemetry ingested and processed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getTelemetry,
  getDeviceTelemetry,
  createTelemetry
};

