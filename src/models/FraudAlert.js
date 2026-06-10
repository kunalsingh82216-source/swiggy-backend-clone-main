const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  reasons: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'under_review'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  userRestricted: { type: Boolean, default: false },
  restrictionEndsAt: Date,
  createdAt: { type: Date, default: Date.now }
});

fraudAlertSchema.index({ status: 1, riskLevel: 1 });
fraudAlertSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);