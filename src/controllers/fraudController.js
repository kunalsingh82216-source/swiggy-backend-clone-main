const Fraud = require('../models/Fraud');
const FraudAlert = require('../models/FraudAlert');
const FraudRule = require('../models/FraudRule');
const User = require('../models/User');
const Order = require('../models/Order');
const fraudDetectionService = require('../services/fraudDetectionService');

// Get all fraud alerts
exports.getFraudAlerts = async (req, res) => {
  try {
    const { status, riskLevel, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;
    
    const alerts = await FraudAlert.find(query)
      .populate('userId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await FraudAlert.countDocuments(query);
    
    res.json({
      success: true, alerts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Review fraud alert
exports.reviewFraudAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { action, adminNotes, restrictUser, restrictionDays } = req.body;
    
    const alert = await FraudAlert.findById(alertId);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    
    let status = 'pending';
    if (action === 'approve') status = 'approved';
    else if (action === 'reject') status = 'rejected';
    
    alert.status = status;
    alert.adminNotes = adminNotes;
    alert.reviewedBy = req.user.id;
    alert.reviewedAt = new Date();
    
    if (restrictUser && action === 'approve') {
      await fraudDetectionService.restrictUser(alert.userId, adminNotes, restrictionDays || 7);
      alert.userRestricted = true;
    }
    
    await alert.save();
    
    if (status === 'approved' && alert.orderId) {
      await Order.findByIdAndUpdate(alert.orderId, {
        status: 'cancelled', cancellationReason: 'Cancelled due to fraud'
      });
    }
    
    res.json({ success: true, message: `Alert ${status} successfully`, alert });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get fraud statistics
exports.getFraudStatistics = async (req, res) => {
  try {
    const totalAlerts = await FraudAlert.countDocuments();
    const pendingAlerts = await FraudAlert.countDocuments({ status: 'pending' });
    const highRiskAlerts = await FraudAlert.countDocuments({ riskLevel: 'high' });
    const criticalAlerts = await FraudAlert.countDocuments({ riskLevel: 'critical' });
    
    res.json({
      success: true,
      statistics: { totalAlerts, pendingAlerts, highRiskAlerts, criticalAlerts }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get fraud rules
exports.getFraudRules = async (req, res) => {
  try {
    const rules = await FraudRule.find();
    res.json({ success: true, rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Remove user restriction
exports.removeUserRestriction = async (req, res) => {
  try {
    const { userId } = req.params;
    await fraudDetectionService.removeRestriction(userId);
    res.json({ success: true, message: 'User restriction removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};