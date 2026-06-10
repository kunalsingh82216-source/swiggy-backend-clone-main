require('dotenv').config();
const mongoose = require('mongoose');
const Recommendation = require('../src/models/Recommendation');

async function seedRecommendations() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swiggy-backend-clone');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing
    await Recommendation.deleteMany({});
    console.log('🗑️ Old recommendations deleted');
    
    console.log('✅ Recommendations table ready');
    console.log('📝 Recommendations will be auto-generated when users place orders');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedRecommendations();