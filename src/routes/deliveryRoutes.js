const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const deliveryController = require('../controllers/deliveryController');

// Public routes (no auth)
router.get('/available', deliveryController.getAvailablePartners);

// Admin only routes
router.post('/register', protect, authorize('admin'), deliveryController.registerPartner);
router.get('/partners', protect, authorize('admin'), deliveryController.getAllPartners);
router.get('/partners/:partnerId', protect, authorize('admin'), deliveryController.getPartnerById);
router.put('/partners/:partnerId/availability', protect, authorize('admin'), deliveryController.updateAvailability);
router.put('/partners/:partnerId/location', protect, authorize('admin'), deliveryController.updateLocation);
router.post('/assign-order', protect, authorize('admin'), deliveryController.assignOrder);
router.put('/complete/:partnerId/:orderId', protect, authorize('admin'), deliveryController.completeDelivery);

module.exports = router;