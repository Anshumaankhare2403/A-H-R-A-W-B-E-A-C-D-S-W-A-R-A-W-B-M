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
      type: Number,
      required: [true, 'Device timestamp is required']
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
      default: false
    },
    suspiciousSSIDList: {
      type: [String],
      default: []
    },
    cameraButton: {
      type: Boolean,
      default: false
    },
    riskLevel: {
      type: String,
      enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH'],
      required: [true, 'Calculated riskLevel is required'],
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

telemetrySchema.index({ deviceId: 1, receivedAt: -1 });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
export default Telemetry;
