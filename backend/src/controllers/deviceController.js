import { Device } from '../models/Device.js';
import { Telemetry } from '../models/Telemetry.js';

export async function getDevices(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status.toUpperCase();
    }
    if (req.query.risk) {
      query.latestRisk = req.query.risk.toUpperCase();
    }

    const [devices, total] = await Promise.all([
      Device.find(query).sort({ lastSeen: -1 }).skip(skip).limit(limit),
      Device.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: devices,
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

export async function getDeviceById(req, res, next) {
  try {
    const { deviceId } = req.params;
    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: `Device with ID "${deviceId}" not found`
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
}

export async function getLatestDeviceTelemetry(req, res, next) {
  try {
    const { deviceId } = req.params;

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({
        success: false,
        error: `Device with ID "${deviceId}" not found`
      });
    }

    const latestTelemetry = await Telemetry.findOne({ deviceId }).sort({ receivedAt: -1 });

    res.json({
      success: true,
      data: {
        device,
        latestTelemetry: latestTelemetry || null
      }
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getDevices,
  getDeviceById,
  getLatestDeviceTelemetry
};
