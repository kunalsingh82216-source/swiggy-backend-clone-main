require('dotenv').config();
const mongoose = require('mongoose');

const fraudRuleSchema = new mongoose.Schema({
  ruleName: String, description: String, enabled: Boolean,
  parameters: { timeWindowMinutes: Number, threshold: Number, weightage: Number },
  action: String
});

const FraudRule = mongoose.model('FraudRule', fraudRuleSchema);

const defaultRules = [
  { ruleName: 'multiple_orders_short_time', description: 'Multiple orders in short time', enabled: true,
    parameters: { timeWindowMinutes: 10, threshold: 3, weightage: 30 }, action: 'flag' },
  { ruleName: 'excessive_cancellations', description: 'Excessive order cancellations', enabled: true,
    parameters: { timeWindowMinutes: 60, threshold: 3, weightage: 40 }, action: 'flag' },
  { ruleName: 'abnormal_coupon_usage', description: 'Abnormal coupon usage', enabled: true,
    parameters: { timeWindowMinutes: 30, threshold: 2, weightage: 25 }, action: 'flag' },
  { ruleName: 'multiple_refund_requests', description: 'Multiple refund requests', enabled: true,
    parameters: { timeWindowMinutes: 1440, threshold: 2, weightage: 50 }, action: 'restrict' },
  { ruleName: 'high_order_frequency', description: 'High order frequency', enabled: true,
    parameters: { timeWindowMinutes: 60, threshold: 0.5, weightage: 35 }, action: 'flag' }
];

async function seedRules() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swiggy_clone');
    console.log('✅ Connected to MongoDB');
    
    for (const rule of defaultRules) {
      await FraudRule.findOneAndUpdate({ ruleName: rule.ruleName }, rule, { upsert: true });
      console.log(`✅ Rule "${rule.ruleName}" seeded`);
    }
    
    console.log('\n🎉 All fraud rules seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedRules();