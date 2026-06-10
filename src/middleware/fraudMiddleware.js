const fraudDetectionService = require('../services/fraudDetectionService');
const User = require('../models/User');

const checkUserRestriction = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.isRestricted) {
      if (user.restrictionEndsAt && new Date() > user.restrictionEndsAt) {
        await fraudDetectionService.removeRestriction(user._id);
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: `Your account is restricted. Reason: ${user.restrictionReason}`,
        restrictionEndsAt: user.restrictionEndsAt
      });
    }
    next();
  } catch (error) {
    next();
  }
};

const evaluateOrderRisk = async (req, res, next) => {
  try {
    const riskAssessment = await fraudDetectionService.evaluateOrderRisk(
      req.user.id, null, { couponCode: req.body.couponCode, orderAmount: req.body.totalAmount }
    );
    
    req.riskAssessment = riskAssessment;
    
    if (riskAssessment.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your order has been blocked due to suspicious activity.',
        riskLevel: riskAssessment.riskLevel
      });
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { checkUserRestriction, evaluateOrderRisk };