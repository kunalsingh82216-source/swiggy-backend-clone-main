const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  score: { type: Number, default: 0, min: 0, max: 100 },
  reason: { type: String },
  isViewed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
recommendationSchema.index({ userId: 1, score: -1 });
recommendationSchema.index({ userId: 1, isViewed: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);