const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Recommendation = require('../models/Recommendation');

class RecommendationService {
  
  // Get user's order history and preferences
  async getUserPreferences(userId) {
    try {
      const orders = await Order.find({ 
        userId, 
        status: 'delivered' 
      }).populate('restaurantId');
      
      if (orders.length === 0) {
        return null;
      }
      
      // Calculate cuisine preferences
      const cuisineCount = {};
      let totalSpent = 0;
      let favoriteRestaurant = null;
      const restaurantOrderCount = {};
      
      orders.forEach(order => {
        totalSpent += order.totalAmount;
        
        if (order.restaurantId) {
          const cuisine = order.restaurantId.cuisine;
          if (cuisine) {
            cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
          }
          
          const restId = order.restaurantId._id.toString();
          restaurantOrderCount[restId] = (restaurantOrderCount[restId] || 0) + 1;
        }
      });
      
      // Find favorite cuisine
      let favoriteCuisine = null;
      let maxCount = 0;
      for (const [cuisine, count] of Object.entries(cuisineCount)) {
        if (count > maxCount) {
          maxCount = count;
          favoriteCuisine = cuisine;
        }
      }
      
      // Find favorite restaurant
      let maxOrders = 0;
      for (const [restId, count] of Object.entries(restaurantOrderCount)) {
        if (count > maxOrders) {
          maxOrders = count;
          favoriteRestaurant = restId;
        }
      }
      
      return {
        favoriteCuisine,
        favoriteRestaurant,
        averageOrderValue: totalSpent / orders.length,
        totalOrders: orders.length,
        cuisinePreferences: cuisineCount
      };
      
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }
  
  // Calculate recommendation score for a restaurant
  calculateScore(restaurant, userPreferences) {
    let score = 0;
    const reasons = [];
    
    // 1. Cuisine match (40% weight)
    if (userPreferences.favoriteCuisine && 
        restaurant.cuisie === userPreferences.favoriteCuisine) {
      score += 40;
      reasons.push('Based on your favorite cuisine');
    }
    
    // 2. Rating (25% weight)
    const ratingScore = (restaurant.rating / 5) * 25;
    score += ratingScore;
    if (restaurant.rating >= 4.5) {
      reasons.push('Highly rated by customers');
    }
    
    // 3. Popularity (20% weight) - based on order count
    const popularityScore = Math.min((restaurant.orderCount / 100) * 20, 20);
    score += popularityScore;
    if (restaurant.orderCount > 50) {
      reasons.push('Popular among users');
    }
    
    // 4. Delivery time (15% weight)
    const deliveryScore = Math.max(0, 15 - (restaurant.deliveryTime / 10));
    score += deliveryScore;
    if (restaurant.deliveryTime <= 30) {
      reasons.push('Fast delivery');
    }
    
    return { score: Math.min(score, 100), reasons };
  }
  
  // Generate recommendations for a user
  async generateRecommendations(userId, limit = 10) {
    try {
      // Get user preferences from order history
      const userPreferences = await this.getUserPreferences(userId);
      
      // Get restaurants that user hasn't ordered from
      const orderedRestaurants = await Order.find({ userId })
        .distinct('restaurantId');
      
      let query = { isApproved: true };
      if (orderedRestaurants.length > 0) {
        query._id = { $nin: orderedRestaurants };
      }
      
      let restaurants = await Restaurant.find(query);
      
      // If user has no order history, return top rated restaurants
      if (!userPreferences) {
        restaurants = await Restaurant.find({ isApproved: true })
          .sort({ rating: -1, orderCount: -1 })
          .limit(limit);
          
        const recommendations = restaurants.map(r => ({
          restaurantId: r._id,
          score: (r.rating / 5) * 100,
          reason: 'Top rated restaurant'
        }));
        
        // Save recommendations
        await Recommendation.deleteMany({ userId });
        for (const rec of recommendations) {
          await Recommendation.create({
            userId,
            restaurantId: rec.restaurantId,
            score: rec.score,
            reason: rec.reason
          });
        }
        
        return restaurants;
      }
      
      // Score each restaurant
      const scoredRestaurants = [];
      for (const restaurant of restaurants) {
        const { score, reasons } = this.calculateScore(restaurant, userPreferences);
        scoredRestaurants.push({
          restaurant,
          score,
          reason: reasons.join(', ')
        });
      }
      
      // Sort by score and get top recommendations
      scoredRestaurants.sort((a, b) => b.score - a.score);
      const topRecommendations = scoredRestaurants.slice(0, limit);
      
      // Save recommendations to database
      await Recommendation.deleteMany({ userId });
      for (const rec of topRecommendations) {
        await Recommendation.create({
          userId,
          restaurantId: rec.restaurant._id,
          score: rec.score,
          reason: rec.reason
        });
      }
      
      return topRecommendations.map(r => r.restaurant);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
  
  // Get user's recommendations from database
  async getUserRecommendations(userId, limit = 10) {
    try {
      const recommendations = await Recommendation.find({ userId })
        .populate('restaurantId')
        .sort({ score: -1 })
        .limit(limit);
      
      return recommendations.map(r => ({
        restaurant: r.restaurantId,
        score: r.score,
        reason: r.reason,
        isViewed: r.isViewed
      }));
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      return [];
    }
  }
  
  // Mark recommendation as viewed
  async markAsViewed(userId, restaurantId) {
    try {
      await Recommendation.updateOne(
        { userId, restaurantId },
        { isViewed: true }
      );
      return true;
    } catch (error) {
      console.error('Error marking as viewed:', error);
      return false;
    }
  }
  
  // Get recommendation stats for admin
  async getRecommendationStats() {
    try {
      const totalRecommendations = await Recommendation.countDocuments();
      const viewedRecommendations = await Recommendation.countDocuments({ isViewed: true });
      const uniqueUsers = await Recommendation.distinct('userId');
      
      return {
        totalRecommendations,
        viewedRecommendations,
        viewRate: totalRecommendations > 0 ? (viewedRecommendations / totalRecommendations * 100).toFixed(2) : 0,
        uniqueUsers: uniqueUsers.length
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {};
    }
  }
}

module.exports = new RecommendationService();