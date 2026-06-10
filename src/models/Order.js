const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 40 },
  surgeMultiplier: { type: Number, default: 1 },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // ========== FRAUD DETECTION FIELDS (TASK 1) ==========
  isFraudSuspicious: { type: Boolean, default: false },
  riskScore: { type: Number, default: 0 },
  cancellationReason: { type: String, default: '' },
  refundRequested: { type: Boolean, default: false },
  refundReason: { type: String, default: '' },
  refundStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'none'], default: 'none' },
  
  deliveryAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ isFraudSuspicious: 1 });
orderSchema.index({ riskScore: -1 });

module.exports = mongoose.model('Order', orderSchema);