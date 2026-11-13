import mongoose from 'mongoose';
import { Alert } from '../models/Alert.js';

export async function getAlerts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.deviceId) {
      query.deviceId = req.query.deviceId.trim();
    }

    if (req.query.severity) {
      query.severity = req.query.severity.toUpperCase();
    }

    if (req.query.acknowledged !== undefined) {
      query.acknowledged = req.query.acknowledged === 'true';
    }

    const [alerts, total] = await Promise.all([
      Alert.find(query).sort({ occurredAt: -1 }).skip(skip).limit(limit),
      Alert.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: alerts,
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

export async function acknowledgeAlert(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid alert ID format: "${id}"`
      });
    }

    const alert = await Alert.findByIdAndUpdate(
      id,
      {
        $set: {
          acknowledged: true,
          acknowledgedAt: new Date()
        }
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: `Alert with ID "${id}" not found`
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
