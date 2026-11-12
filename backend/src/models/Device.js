import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: function () {
        return `ESP32-${this.deviceId}`;
      }
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'warning', 'error'],
      default: 'online',
      index: true
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true
    },
    latestRisk: {
      type: String,
      enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH'],
      default: 'SAFE',
      index: true
    },
    latestRfValue: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes
deviceSchema.index({ status: 1, lastSeen: -1 });

export const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
export default Device;

