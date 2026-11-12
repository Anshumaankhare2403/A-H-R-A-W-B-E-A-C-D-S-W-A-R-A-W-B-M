import mongoose from 'mongoose';
import Alert from '../models/Alert.js';

export async function getAlerts(req, res, next) {
  try {
    const { page, limit } = req.pagination;
    const { deviceId, severity, acknowledged } = req.query;

    const filter = {};
    if (deviceId) filter.deviceId = deviceId;
    if (severity) filter.severity = severity.toUpperCase();
    if (acknowledged !== undefined) filter.acknowledged = acknowledged === 'true';

    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ occurredAt: -1 }).skip(skip).limit(limit),
      Alert.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: alerts,
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

export async function acknowledgeAlert(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid Alert ID format: "${id}"`,
          statusCode: 400
        }
      });
    }

    const alert = await Alert.findByIdAndUpdate(
      id,
      { acknowledged: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Alert with ID "${id}" not found`,
          statusCode: 404
        }
      });
    }

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getAlerts,
  acknowledgeAlert
};

