const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkUserRestriction, evaluateOrderRisk } = require('../middleware/fraudMiddleware');
const orderController = require('../controllers/orderController');
const fraudController = require('../controllers/fraudController');

// User routes with fraud detection
router.post('/orders/create', protect, checkUserRestriction, evaluateOrderRisk, orderController.createOrder);
router.put('/orders/cancel/:orderId', protect, checkUserRestriction, orderController.cancelOrder);
router.post('/orders/refund/:orderId', protect, checkUserRestriction, orderController.requestRefund);

// Admin fraud management routes
router.get('/admin/fraud/alerts', protect, fraudController.getFraudAlerts);
router.put('/admin/fraud/alerts/:alertId/review', protect, fraudController.reviewFraudAlert);
router.get('/admin/fraud/statistics', protect, fraudController.getFraudStatistics);
router.get('/admin/fraud/rules', protect, fraudController.getFraudRules);
router.delete('/admin/users/:userId/restriction', protect, fraudController.removeUserRestriction);

module.exports = router;