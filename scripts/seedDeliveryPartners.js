require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const DeliveryPartner = require('../src/models/DeliveryPartner');

const deliveryPartners = [
  {
    name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul@delivery.com',
    password: '123456',
    currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore
    isAvailable: true,
    vehicleType: 'bike',
    vehicleNumber: 'KA01AB1234',
    rating: 4.8
  },
  {
    name: 'Priya Singh',
    phone: '9876543211',
    email: 'priya@delivery.com',
    password: '123456',
    currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
    isAvailable: true,
    vehicleType: 'scooter',
    vehicleNumber: 'KA02CD5678',
    rating: 4.9
  },
  {
    name: 'Amit Kumar',
    phone: '9876543212',
    email: 'amit@delivery.com',
    password: '123456',
    currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
    isAvailable: false,
    vehicleType: 'bike',
    vehicleNumber: 'KA03EF9012',
    rating: 4.5
  }
];

async function seedDeliveryPartners() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swiggy-backend-clone');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing
    await DeliveryPartner.deleteMany({});
    console.log('🗑️ Old delivery partners deleted');
    
    // Hash passwords
    for (const partner of deliveryPartners) {
      partner.password = await bcrypt.hash(partner.password, 10);
    }
    
    await DeliveryPartner.insertMany(deliveryPartners);
    console.log(`✅ ${deliveryPartners.length} delivery partners added successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDeliveryPartners();