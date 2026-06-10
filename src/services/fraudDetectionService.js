const { FraudAlert, FraudRule, UserBehaviorLog } = require('../models/FraudAlert');
const User = require('../models/User');
const Fraud = require('../models/Fraud');

class FraudDetectionService {
  
  // Main method to evaluate risk for an order
  async evaluateOrderRisk(userId, orderId, orderDetails = {}) {
    try {
      const riskFactors = [];
      let totalRiskScore = 0;
      
      const rules = await FraudRule.find({ enabled: true });
      
      for (const rule of rules) {
        const result = await this.checkRule(userId, rule, orderDetails);
        if (result.triggered) {
          riskFactors.push({ reason: rule.ruleName, score: result.score });
          totalRiskScore += result.score * (rule.parameters.weightage / 100);
        }
      }
      
      totalRiskScore = Math.min(totalRiskScore, 100);
      
      let riskLevel = 'low';
      if (totalRiskScore >= 70) riskLevel = 'critical';
      else if (totalRiskScore >= 50) riskLevel = 'high';
      else if (totalRiskScore >= 30) riskLevel = 'medium';
      
      // Create fraud alert if risk score > 30
      if (totalRiskScore > 30) {
        await FraudAlert.create({
          userId, orderId, riskScore: totalRiskScore, riskLevel,
          reasons: riskFactors.map(f => f.reason), status: 'pending'
        });
        
        await Fraud.create({
          orderId, userId, riskScore: totalRiskScore, riskLevel,
          reason: riskFactors.map(f => f.reason).join(', '), status: 'pending'
        });
      }
      
      // Update user's fraud risk score
      await User.findByIdAndUpdate(userId, { fraudRiskScore: totalRiskScore });
      
      // If critical risk, restrict user
      if (riskLevel === 'critical') {
        await this.restrictUser(userId, 'Critical fraud risk detected', 7);
      }
      
      return {
        riskScore: totalRiskScore,
        riskLevel,
        isSuspicious: totalRiskScore > 30,
        isBlocked: totalRiskScore > 70,
        reasons: riskFactors.map(f => f.reason)
      };
      
    } catch (error) {
      console.error('Error evaluating order risk:', error);
      return { riskScore: 0, isSuspicious: false, isBlocked: false };
    }
  }
  
  async checkRule(userId, rule, orderDetails) {
    const { timeWindowMinutes, threshold } = rule.parameters;
    const startTime = new Date(Date.now() - timeWindowMinutes * 60000);
    
    switch(rule.ruleName) {
      case 'multiple_orders_short_time':
        const orderCount = await UserBehaviorLog.countDocuments({
          userId, action: 'order_created', timestamp: { $gte: startTime }
        });
        if (orderCount >= threshold) {
          return { triggered: true, score: Math.min((orderCount / threshold) * 100, 100) };
        }
        break;
        
      case 'excessive_cancellations':
        const cancelCount = await UserBehaviorLog.countDocuments({
          userId, action: 'order_cancelled', timestamp: { $gte: startTime }
        });
        if (cancelCount >= threshold) {
          return { triggered: true, score: Math.min((cancelCount / threshold) * 100, 100) };
        }
        
        const user = await User.findById(userId);
        const cancellationRate = user.totalOrders > 0 ? (user.totalCancellations / user.totalOrders) * 100 : 0;
        if (cancellationRate > 30) {
          return { triggered: true, score: 50 };
        }
        break;
        
      case 'multiple_refund_requests':
        const refundCount = await UserBehaviorLog.countDocuments({
          userId, action: 'refund_requested', timestamp: { $gte: startTime }
        });
        if (refundCount >= threshold) {
          return { triggered: true, score: Math.min((refundCount / threshold) * 100, 100) };
        }
        break;
    }
    
    return { triggered: false, score: 0 };
  }
  
  async restrictUser(userId, reason, days = 7) {
    const restrictionEndsAt = new Date();
    restrictionEndsAt.setDate(restrictionEndsAt.getDate() + days);
    
    await User.findByIdAndUpdate(userId, {
      isRestricted: true, restrictionReason: reason, restrictionEndsAt
    });
  }
  
  async removeRestriction(userId) {
    await User.findByIdAndUpdate(userId, {
      isRestricted: false, restrictionReason: null, restrictionEndsAt: null
    });
  }
  
  async logBehavior(userId, action, orderId = null, details = {}, req = null) {
    await UserBehaviorLog.create({
      userId, action, orderId, details,
      ipAddress: req?.ip, userAgent: req?.headers?.['user-agent']
    });
    
    const user = await User.findById(userId);
    if (action === 'order_created') user.totalOrders += 1;
    else if (action === 'order_cancelled') user.totalCancellations += 1;
    else if (action === 'refund_requested') user.totalRefunds += 1;
    await user.save();
  }
}

module.exports = new FraudDetectionService();