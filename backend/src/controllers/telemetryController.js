import { Telemetry } from '../models/Telemetry.js';
import { processTelemetry } from '../services/telemetryService.js';

export async function getTelemetry(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.deviceId) {
      query.deviceId = req.query.deviceId.trim();
    }

    if (req.query.riskLevel) {
      query.riskLevel = req.query.riskLevel.toUpperCase();
    }

    if (req.query.startDate || req.query.endDate) {
      query.receivedAt = {};
      if (req.query.startDate) {
        query.receivedAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.receivedAt.$lte = new Date(req.query.endDate);
      }
    }

    const [records, total] = await Promise.all([
      Telemetry.find(query).sort({ receivedAt: -1 }).skip(skip).limit(limit),
      Telemetry.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTelemetryByDeviceId(req, res, next) {
  try {
    const { deviceId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const query = { deviceId };

    const [records, total] = await Promise.all([
      Telemetry.find(query).sort({ receivedAt: -1 }).skip(skip).limit(limit),
      Telemetry.countDocuments(query)
    ]);

    res.json({
      success: true,
      deviceId,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createTelemetry(req, res, next) {
  try {
    const result = await processTelemetry(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Telemetry processed successfully',
      data: {
        telemetry: result.telemetry,
        device: result.device,
        alert: result.alert
      }
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getTelemetry,
  getTelemetryByDeviceId,
  createTelemetry
};
