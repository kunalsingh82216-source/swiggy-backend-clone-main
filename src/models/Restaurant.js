const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cuisine: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  priceRange: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  deliveryTime: { type: Number, default: 30 }, // in minutes
  isVeg: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  image: { type: String },
  orderCount: { type: Number, default: 0 },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

// ========== INDEXES FOR FAST SEARCH ==========
// Text index for name and cuisine search
restaurantSchema.index({ name: 'text', cuisine: 'text', city: 'text' });

// Compound index for filtering
restaurantSchema.index({ city: 1, rating: -1 });
restaurantSchema.index({ cuisine: 1, rating: -1 });
restaurantSchema.index({ isVeg: 1, rating: -1 });
restaurantSchema.index({ priceRange: 1, rating: -1 });

// Index for sorting
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ deliveryTime: 1 });
restaurantSchema.index({ orderCount: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);