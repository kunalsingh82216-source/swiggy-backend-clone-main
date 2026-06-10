const mongoose = require('mongoose');

const userBehaviorLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['order_created', 'order_cancelled', 'refund_requested', 'coupon_used'], required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

// Indexes for performance
userBehaviorLogSchema.index({ userId: 1, timestamp: -1 });
userBehaviorLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('UserBehaviorLog', userBehaviorLogSchema);