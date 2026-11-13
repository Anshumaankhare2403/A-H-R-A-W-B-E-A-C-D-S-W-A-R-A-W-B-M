import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: [true, 'Alert severity is required'],
      index: true
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      trim: true
    },
    rfValue: {
      type: Number,
      default: 0
    },
    suspiciousSSIDs: {
      type: [String],
      default: []
    },
    cameraButton: {
      type: Boolean,
      default: false
    },
    acknowledged: {
      type: Boolean,
      default: false,
      index: true
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

alertSchema.index({ deviceId: 1, acknowledged: 1, occurredAt: -1 });

export const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
