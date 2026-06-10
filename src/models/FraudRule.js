const mongoose = require('mongoose');

const fraudRuleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true, unique: true },
  description: String,
  enabled: { type: Boolean, default: true },
  parameters: {
    timeWindowMinutes: Number,
    threshold: Number,
    weightage: Number
  },
  action: { type: String, enum: ['flag', 'restrict', 'block'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FraudRule', fraudRuleSchema);