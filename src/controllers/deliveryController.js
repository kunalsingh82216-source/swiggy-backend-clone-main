const DeliveryPartner = require('../models/DeliveryPartner');
const deliveryAssignmentService = require('../services/deliveryAssignmentService');
const bcrypt = require('bcryptjs');

// Register as delivery partner (Admin only or self)
exports.registerPartner = async (req, res) => {
  try {
    const { name, phone, email, password, vehicleType, vehicleNumber, lat, lng } = req.body;
    
    const existingPartner = await DeliveryPartner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ success: false, message: 'Partner already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const partner = new DeliveryPartner({
      name,
      phone,
      email,
      password: hashedPassword,
      vehicleType,
      vehicleNumber,
      currentLocation: {
        type: 'Point',
        coordinates: [lng || 0, lat || 0]
      }
    });
    
    await partner.save();
    
    res.status(201).json({
      success: true,
      message: 'Delivery partner registered successfully',
      data: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        isAvailable: partner.isAvailable
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all delivery partners (Admin only)
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().select('-password');
    
    res.json({
      success: true,
      count: partners.length,
      data: partners
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available partners near a location
exports.getAvailablePartners = async (req, res) => {
  try {
    const { lat, lng, limit = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }
    
    const partners = await deliveryAssignmentService.findNearestPartner(
      { lat: parseFloat(lat), lng: parseFloat(lng) },
      parseInt(limit)
    );
    
    res.json({
      success: true,
      count: partners.length,
      data: partners
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update delivery partner availability
exports.updateAvailability = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { isAvailable } = req.body;
    
    const result = await deliveryAssignmentService.updateAvailability(partnerId, isAvailable);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Partner is now ${isAvailable ? 'available' : 'unavailable'}`
      });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update delivery partner location
exports.updateLocation = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { lat, lng } = req.body;
    
    const result = await deliveryAssignmentService.updateLocation(partnerId, lat, lng);
    
    if (result.success) {
      res.json({ success: true, message: 'Location updated successfully' });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign delivery partner for an order (Admin only)
exports.assignOrder = async (req, res) => {
  try {
    const { orderId, restaurantLat, restaurantLng } = req.body;
    
    const result = await deliveryAssignmentService.assignDeliveryPartner(
      orderId,
      { lat: restaurantLat, lng: restaurantLng }
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Delivery partner assigned successfully',
        data: result.deliveryPartner
      });
    } else {
      res.status(404).json({ success: false, message: result.message });
    }
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete delivery
exports.completeDelivery = async (req, res) => {
  try {
    const { partnerId, orderId } = req.params;
    
    const result = await deliveryAssignmentService.completeDelivery(partnerId, orderId);
    
    if (result.success) {
      res.json({ success: true, message: 'Delivery completed successfully' });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get partner by ID
exports.getPartnerById = async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    const partner = await DeliveryPartner.findById(partnerId).select('-password');
    
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    
    res.json({ success: true, data: partner });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};