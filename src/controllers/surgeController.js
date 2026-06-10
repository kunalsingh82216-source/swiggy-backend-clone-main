const surgePricingService = require('../services/surgePricingService');
const SurgeSetting = require('../models/SurgeSetting');

// Calculate delivery fee (public API)
exports.calculateDeliveryFee = async (req, res) => {
  try {
    const { distance = 5 } = req.query;
    
    const feeDetails = await surgePricingService.calculateDeliveryFee(parseFloat(distance));
    
    res.json({
      success: true,
      data: feeDetails,
      message: feeDetails.isSurgeActive ? 
        `⚠️ Surge pricing active (${feeDetails.surgeMultiplier}x) during ${feeDetails.peakHourName}` : 
        'Normal pricing'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current surge multiplier (public)
exports.getCurrentMultiplier = async (req, res) => {
  try {
    const multiplier = await surgePricingService.getCurrentMultiplier();
    const peakHourName = await surgePricingService.getPeakHourName();
    
    res.json({
      success: true,
      data: {
        multiplier,
        isSurgeActive: multiplier > 1,
        peakHour: peakHourName
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== ADMIN ONLY APIS ==========

// Get surge settings (admin)
exports.getSurgeSettings = async (req, res) => {
  try {
    const settings = await surgePricingService.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update surge settings (admin)
exports.updateSurgeSettings = async (req, res) => {
  try {
    const {
      peakHours,
      baseDeliveryFee,
      distanceFeePerKm,
      freeDeliveryDistance,
      maxSurgeMultiplier,
      isEnabled
    } = req.body;
    
    const updateData = {};
    if (peakHours) updateData.peakHours = peakHours;
    if (baseDeliveryFee) updateData.baseDeliveryFee = baseDeliveryFee;
    if (distanceFeePerKm) updateData.distanceFeePerKm = distanceFeePerKm;
    if (freeDeliveryDistance) updateData.freeDeliveryDistance = freeDeliveryDistance;
    if (maxSurgeMultiplier) updateData.maxSurgeMultiplier = maxSurgeMultiplier;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    
    const settings = await surgePricingService.updateSettings(updateData, req.user.id);
    
    res.json({
      success: true,
      message: 'Surge settings updated successfully',
      data: settings
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset to default settings (admin)
exports.resetSurgeSettings = async (req, res) => {
  try {
    const defaultSettings = {
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
    };
    
    const settings = await SurgeSetting.findOneAndUpdate(
      {},
      { ...defaultSettings, updatedBy: req.user.id, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Surge settings reset to default',
      data: settings
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};