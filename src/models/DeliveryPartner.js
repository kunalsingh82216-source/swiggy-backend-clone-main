const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Location coordinates
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  
  // Status
  isAvailable: { type: Boolean, default: true },
  currentOrders: { type: Number, default: 0 },
  maxOrders: { type: Number, default: 3 },
  
  // Performance metrics
  totalDeliveries: { type: Number, default: 0 },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  
  // Vehicle info
  vehicleType: { type: String, enum: ['bike', 'scooter', 'car'], default: 'bike' },
  vehicleNumber: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

// Geospatial index for location queries
deliveryPartnerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);