import mongoose from 'mongoose';

const wifiNetworkSchema = new mongoose.Schema(
  {
    ssid: {
      type: String,
      required: true,
      trim: true
    },
    suspicious: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const telemetrySchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      trim: true,
      index: true
    },
    deviceTimestamp: {
      type: Date,
      default: Date.now
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    rfValue: {
      type: Number,
      required: [true, 'RF value is required'],
      min: [0, 'RF value cannot be negative']
    },
    rfAnomaly: {
      type: Boolean,
      required: true
    },
    wifiNetworks: {
      type: [wifiNetworkSchema],
      default: []
    },
    suspiciousSSID: {
      type: Boolean,
      required: true
    },
    cameraButton: {
      type: Boolean,
      default: false
    },
    riskLevel: {
      type: String,
      enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH'],
      required: [true, 'Risk level is required'],
      index: true
    }
  },
  {
    timestamps: false
  }
);

// Compound indexes for fast historical queries and time-series aggregation
telemetrySchema.index({ deviceId: 1, receivedAt: -1 });
telemetrySchema.index({ riskLevel: 1, receivedAt: -1 });

export const Telemetry = mongoose.models.Telemetry || mongoose.model('Telemetry', telemetrySchema);
export default Telemetry;

