require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');

const restaurants = [
  { name: 'Pizza Palace', cuisine: 'Italian', city: 'Bangalore', address: 'MG Road', rating: 4.5, priceRange: 'medium', deliveryTime: 30, isVeg: false },
  { name: 'Burger King', cuisine: 'Fast Food', city: 'Bangalore', address: 'Indiranagar', rating: 4.2, priceRange: 'low', deliveryTime: 25, isVeg: false },
  { name: 'Spice Garden', cuisine: 'Indian', city: 'Bangalore', address: 'Koramangala', rating: 4.7, priceRange: 'medium', deliveryTime: 35, isVeg: true },
  { name: 'China Town', cuisine: 'Chinese', city: 'Mumbai', address: 'Andheri', rating: 4.3, priceRange: 'medium', deliveryTime: 40, isVeg: false },
  { name: 'Sagar Ratna', cuisine: 'South Indian', city: 'Bangalore', address: 'Jaynagar', rating: 4.4, priceRange: 'low', deliveryTime: 25, isVeg: true },
  { name: 'McDonalds', cuisine: 'Fast Food', city: 'Mumbai', address: 'Bandra', rating: 4.1, priceRange: 'low', deliveryTime: 20, isVeg: false },
  { name: 'Tandoori Nights', cuisine: 'Indian', city: 'Delhi', address: 'Connaught Place', rating: 4.6, priceRange: 'high', deliveryTime: 45, isVeg: false },
  { name: 'Green Leaf', cuisine: 'Healthy', city: 'Bangalore', address: 'Whitefield', rating: 4.3, priceRange: 'medium', deliveryTime: 30, isVeg: true },
  { name: 'Dominos', cuisine: 'Italian', city: 'Bangalore', address: 'BTM Layout', rating: 4.0, priceRange: 'medium', deliveryTime: 35, isVeg: false },
  { name: 'KFC', cuisine: 'Fast Food', city: 'Bangalore', address: 'Marathahalli', rating: 4.2, priceRange: 'medium', deliveryTime: 30, isVeg: false }
];

async function seedRestaurants() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swiggy-backend-clone');
    console.log('✅ Connected to MongoDB');
    
    await Restaurant.deleteMany({});
    console.log('🗑️ Old restaurants deleted');
    
    await Restaurant.insertMany(restaurants);
    console.log(`✅ ${restaurants.length} restaurants added successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedRestaurants();