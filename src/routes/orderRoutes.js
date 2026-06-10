const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkUserRestriction, evaluateOrderRisk } = require('../middleware/fraudMiddleware');
const orderController = require('../controllers/orderController');

// ============ USER ROUTES (Task 1 & 5) ============
router.post('/create', protect, authorize('user'), checkUserRestriction, evaluateOrderRisk, orderController.createOrder);
router.put('/cancel/:orderId', protect, authorize('user'), checkUserRestriction, orderController.cancelOrder);
router.post('/refund/:orderId', protect, authorize('user'), checkUserRestriction, orderController.requestRefund);
router.get('/my', protect, authorize('user'), orderController.getMyOrders);

// ============ ORDER TRACKING ROUTES (Task 5) ============
router.get('/:id/status', protect, orderController.getOrderStatus);
router.get('/:id/history', protect, orderController.getOrderStatusHistory);
router.get('/:id/tracking', protect, orderController.getOrderWithHistory);

// ============ ADMIN/RESTAURANT ROUTES (Task 5) ============
router.put('/:id/status', protect, authorize('restaurant', 'admin'), orderController.updateOrderStatus);

module.exports = router;