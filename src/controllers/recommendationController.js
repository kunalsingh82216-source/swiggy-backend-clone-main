const recommendationService = require('../services/recommendationService');

// Get personalized recommendations for logged-in user
exports.getMyRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recommendations = await recommendationService.getUserRecommendations(
      req.user.id,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      message: recommendations.length === 0 ? 
        'Order something to get personalized recommendations!' : 
        'Personalized recommendations based on your order history'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate fresh recommendations (can be called after order)
exports.generateRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const recommendations = await recommendationService.generateRecommendations(
      req.user.id,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      message: 'Recommendations generated successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark recommendation as viewed
exports.markAsViewed = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    await recommendationService.markAsViewed(req.user.id, restaurantId);
    
    res.json({ success: true, message: 'Recommendation marked as viewed' });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ADMIN ONLY ============

// Get recommendations for any user (admin)
exports.getUserRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const recommendations = await recommendationService.getUserRecommendations(
      userId,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate recommendations for any user (admin)
exports.generateUserRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const recommendations = await recommendationService.generateRecommendations(
      userId,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      message: `Recommendations generated for user ${userId}`
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recommendation stats (admin)
exports.getRecommendationStats = async (req, res) => {
  try {
    const stats = await recommendationService.getRecommendationStats();
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};