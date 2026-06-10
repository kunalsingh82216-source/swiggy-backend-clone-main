const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const surgeController = require('../controllers/surgeController');

// Public routes (no authentication needed)
router.get('/calculate-fee', surgeController.calculateDeliveryFee);
router.get('/current-multiplier', surgeController.getCurrentMultiplier);

// Admin only routes
router.get('/settings', protect, authorize('admin'), surgeController.getSurgeSettings);
router.put('/settings', protect, authorize('admin'), surgeController.updateSurgeSettings);
router.post('/settings/reset', protect, authorize('admin'), surgeController.resetSurgeSettings);

module.exports = router;