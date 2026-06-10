const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const recommendationController = require('../controllers/recommendationController');

// ============ USER ROUTES ============
router.get('/my', protect, recommendationController.getMyRecommendations);
router.post('/generate', protect, recommendationController.generateRecommendations);
router.put('/view/:restaurantId', protect, recommendationController.markAsViewed);

// ============ ADMIN ROUTES ============
router.get('/admin/stats', protect, authorize('admin'), recommendationController.getRecommendationStats);
router.get('/admin/user/:userId', protect, authorize('admin'), recommendationController.getUserRecommendations);
router.post('/admin/user/:userId/generate', protect, authorize('admin'), recommendationController.generateUserRecommendations);

module.exports = router;