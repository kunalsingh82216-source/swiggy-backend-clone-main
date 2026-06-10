const mongoose = require('mongoose');

const surgeSettingSchema = new mongoose.Schema({
  peakHours: {
    morning: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '10:00' },
      multiplier: { type: Number, default: 1.2 }
    },
    lunch: {
      start: { type: String, default: '12:00' },
      end: { type: String, default: '15:00' },
      multiplier: { type: Number, default: 1.5 }
    },
    dinner: {
      start: { type: String, default: '19:00' },
      end: { type: String, default: '22:00' },
      multiplier: { type: Number, default: 1.8 }
    }
  },
  baseDeliveryFee: { type: Number, default: 40 },
  distanceFeePerKm: { type: Number, default: 10 },
  freeDeliveryDistance: { type: Number, default: 3 },
  maxSurgeMultiplier: { type: Number, default: 3.0 },
  isEnabled: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SurgeSetting', surgeSettingSchema);