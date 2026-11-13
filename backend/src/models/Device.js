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
        return this?.deviceId ? `Device-${this.deviceId}` : 'Device-unnamed';
      }
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'WARNING', 'ALERT'],
      default: 'ONLINE',
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
    timestamps: true,
    versionKey: false
  }
);

deviceSchema.statics.upsertOnTelemetry = async function (deviceId, rfValue, riskLevel) {
  let status = 'ONLINE';
  if (riskLevel === 'HIGH') {
    status = 'ALERT';
  } else if (riskLevel === 'MEDIUM' || riskLevel === 'LOW') {
    status = 'WARNING';
  }

  return this.findOneAndUpdate(
    { deviceId },
    {
      $set: {
        lastSeen: new Date(),
        latestRfValue: rfValue,
        latestRisk: riskLevel,
        status
      },
      $setOnInsert: {
        name: `Device-${deviceId}`
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const Device = mongoose.model('Device', deviceSchema);
export default Device;
