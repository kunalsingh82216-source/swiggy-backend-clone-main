require('dotenv').config();
const mongoose = require('mongoose');
const SurgeSetting = require('../src/models/SurgeSetting');

async function seedSurgeSettings() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swiggy-backend-clone');
    console.log('✅ Connected to MongoDB');
    
    const existing = await SurgeSetting.findOne();
    
    if (!existing) {
      await SurgeSetting.create({
        peakHours: {
          morning: { start: '08:00', end: '10:00', multiplier: 1.2 },
          lunch: { start: '12:00', end: '15:00', multiplier: 1.5 },
          dinner: { start: '19:00', end: '22:00', multiplier: 1.8 }
        },
        baseDeliveryFee: 40,
        distanceFeePerKm: 10,
        freeDeliveryDistance: 3,
        maxSurgeMultiplier: 3.0,
        isEnabled: true
      });
      console.log('✅ Surge settings created successfully');
    } else {
      console.log('⚠️ Surge settings already exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedSurgeSettings();