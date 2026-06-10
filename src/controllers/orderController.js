const Order = require('../models/Order');
const UserBehaviorLog = require('../models/UserBehaviorLog');
const FraudAlert = require('../models/FraudAlert');
const notificationService = require('../services/notificationService');
const recommendationService = require('../services/recommendationService');

// ============ FRAUD DETECTION FUNCTIONS (TASK 1) ============

// Log user behavior
const logBehavior = async (userId, action, orderId, details = {}) => {
  try {
    await UserBehaviorLog.create({
      userId,
      action,
      orderId,
      details,
      timestamp: new Date()
    });
    console.log(`✅ Logged: ${action} for user ${userId}`);
  } catch (error) {
    console.error('Log behavior error:', error);
  }
};

// Check for multiple orders in short time
const checkMultipleOrders = async (userId) => {
  const startTime = new Date(Date.now() - 10 * 60 * 1000); // Last 10 minutes
  const orderCount = await UserBehaviorLog.countDocuments({
    userId,
    action: 'order_created',
    timestamp: { $gte: startTime }
  });
  console.log(`📊 User ${userId} has ${orderCount} orders in last 10 minutes`);
  return orderCount;
};

// Evaluate fraud risk
const evaluateRisk = async (userId, orderId) => {
  try {
    let riskScore = 0;
    const reasons = [];
    
    // Check multiple orders in 10 minutes
    const orderCount = await checkMultipleOrders(userId);
    if (orderCount >= 3) {
      riskScore += 40;
      reasons.push('multiple_orders_short_time');
      console.log(`⚠️ Fraud detected: ${orderCount} orders in 10 minutes`);
    }
    
    // Create fraud alert if risk score > 30
    if (riskScore > 30) {
      await FraudAlert.create({
        userId,
        orderId,
        riskScore,
        riskLevel: riskScore >= 70 ? 'critical' : riskScore >= 50 ? 'high' : 'medium',
        reasons,
        status: 'pending'
      });
      console.log(`🚨 Fraud alert created! Risk score: ${riskScore}`);
      return { isSuspicious: true, riskScore, reasons };
    }
    
    return { isSuspicious: false, riskScore: 0, reasons: [] };
  } catch (error) {
    console.error('Fraud evaluation error:', error);
    return { isSuspicious: false, riskScore: 0, reasons: [] };
  }
};

// ============ ORDER CRUD OPERATIONS ============

// Create Order with Fraud Detection (Task 1) + Trigger Recommendations (Task 6)
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;
    
    console.log('📝 Creating order for user:', req.user.id);
    
    // Create order
    const order = new Order({
      userId: req.user.id,
      items: items || [],
      totalAmount: totalAmount || 0,
      deliveryAddress: deliveryAddress || '',
      paymentMethod: paymentMethod || 'cod',
      status: 'pending',
      statusHistory: [{ status: 'pending', timestamp: new Date(), updatedBy: req.user.name }]
    });
    
    await order.save();
    console.log('✅ Order created:', order._id);
    
    // Log behavior for fraud detection
    await logBehavior(req.user.id, 'order_created', order._id, { totalAmount });
    
    // Evaluate fraud risk
    const fraudResult = await evaluateRisk(req.user.id, order._id);
    
    if (fraudResult.isSuspicious) {
      order.isFraudSuspicious = true;
      order.riskScore = fraudResult.riskScore;
      await order.save();
      console.log(`🚨 Order flagged as suspicious! Risk score: ${fraudResult.riskScore}`);
    }
    
    // ============ TASK 6: TRIGGER RECOMMENDATIONS (Async - Don't wait) ============
    // After order is successfully created, generate personalized recommendations
    setTimeout(async () => {
      try {
        await recommendationService.generateRecommendations(req.user.id, 10);
        console.log(`📊 Recommendations generated for user ${req.user.id} after order`);
      } catch (recError) {
        console.error('Error generating recommendations:', recError);
      }
    }, 1000);
    
    res.status(201).json({
      success: true,
      message: fraudResult.isSuspicious ? '⚠️ Order flagged for review' : '✅ Order created successfully',
      order,
      fraudAlert: fraudResult.isSuspicious ? {
        riskLevel: fraudResult.riskScore >= 70 ? 'critical' : fraudResult.riskScore >= 50 ? 'high' : 'medium',
        reasons: fraudResult.reasons
      } : null
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('restaurantId', 'name image')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Order with Fraud Tracking (Task 1)
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
    }
    
    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: req.user.name
    });
    await order.save();
    
    // Log cancellation for fraud detection
    await logBehavior(req.user.id, 'order_cancelled', order._id, { reason });
    
    // Send notification (Task 5)
    await notificationService.sendNotification(
      req.user.id,
      order._id,
      'Order Cancelled',
      `Your order #${order._id} has been cancelled. Reason: ${reason || 'User requested'}`,
      'order_update'
    );
    
    res.json({ success: true, message: 'Order cancelled successfully' });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request Refund with Fraud Tracking (Task 1)
exports.requestRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Refund only for delivered orders' });
    }
    
    order.refundRequested = true;
    order.refundReason = reason;
    order.refundStatus = 'pending';
    await order.save();
    
    await logBehavior(req.user.id, 'refund_requested', order._id, { reason });
    
    res.json({ success: true, message: 'Refund request submitted' });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ REAL-TIME ORDER STATUS (TASK 5) ============

// Update Order Status with Real-time Notification
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const oldStatus = order.status;
    order.status = orderStatus;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: orderStatus,
      timestamp: new Date(),
      updatedBy: req.user.role
    });
    
    await order.save();
    
    // Send real-time notification via WebSocket (Task 5)
    await notificationService.notifyOrderStatusChange(order, oldStatus, orderStatus);
    
    res.status(200).json({
      success: true,
      message: `Order status updated from ${oldStatus} to ${orderStatus}`,
      data: order
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order with full details (for tracking page) - Task 5
exports.getOrderWithHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('restaurantId', 'name image address phone')
      .populate('deliveryPartnerId', 'name phone rating vehicleType');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check authorization
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: order });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order status history only - Task 5
exports.getOrderStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id).select('statusHistory createdAt');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check authorization
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: order.statusHistory || [] });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order status only (quick status check) - Task 5
exports.getOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id).select('status isFraudSuspicious riskScore');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ 
      success: true, 
      data: {
        status: order.status,
        isFraudSuspicious: order.isFraudSuspicious,
        riskScore: order.riskScore
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};