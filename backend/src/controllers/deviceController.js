import Device from '../models/Device.js';
import Telemetry from '../models/Telemetry.js';

export async function getDevices(req, res, next) {
  try {
    const { page, limit } = req.pagination;
    const { status, risk } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (risk) filter.latestRisk = risk.toUpperCase();

    const skip = (page - 1) * limit;
    const [devices, total] = await Promise.all([
      Device.find(filter).sort({ lastSeen: -1 }).skip(skip).limit(limit),
      Device.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: devices,
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

export async function getDeviceById(req, res, next) {
  try {
    const { deviceId } = req.params;
    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Device with ID "${deviceId}" not found`,
          statusCode: 404
        }
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

export async function getDeviceLatestTelemetry(req, res, next) {
  try {
    const { deviceId } = req.params;
    const latest = await Telemetry.findOne({ deviceId }).sort({ receivedAt: -1 });

    if (!latest) {
      return res.status(404).json({
        success: false,
        error: {
          message: `No telemetry found for device "${deviceId}"`,
          statusCode: 404
        }
      });
    }

    res.json({
      success: true,
      data: latest
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getDevices,
  getDeviceById,
  getDeviceLatestTelemetry
};

