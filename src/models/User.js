const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin', 'restaurant', 'delivery'], default: 'user' },
  address: { type: String },
  isBlocked: { type: Boolean, default: false },
  
  // ========== FRAUD DETECTION FIELDS (TASK 1) ==========
  isRestricted: { type: Boolean, default: false },
  restrictionReason: { type: String, default: '' },
  restrictionEndsAt: { type: Date, default: null },
  fraudRiskScore: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalCancellations: { type: Number, default: 0 },
  totalRefunds: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);