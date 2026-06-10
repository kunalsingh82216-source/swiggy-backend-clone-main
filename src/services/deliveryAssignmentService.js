const DeliveryPartner = require('../models/DeliveryPartner');

class DeliveryAssignmentService {
  
  // Calculate distance between two coordinates (Haversine formula in km)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Find nearest available delivery partner
  async findNearestPartner(restaurantLocation, limit = 5) {
    try {
      const partners = await DeliveryPartner.find({
        isAvailable: true,
        currentOrders: { $lt: 3 } // Less than max orders
      });
      
      if (partners.length === 0) {
        return [];
      }
      
      // Calculate distance for each partner
      const partnersWithDistance = partners.map(partner => {
        const distance = this.calculateDistance(
          restaurantLocation.lat,
          restaurantLocation.lng,
          partner.currentLocation.coordinates[1],
          partner.currentLocation.coordinates[0]
        );
        
        // Calculate score (lower distance = higher score)
        const score = (1 / (distance + 0.1)) * (1 - (partner.currentOrders / 3)) * (partner.rating / 5);
        
        return {
          ...partner.toObject(),
          distance: Math.round(distance * 100) / 100,
          score: Math.round(score * 100) / 100
        };
      });
      
      // Sort by distance (nearest first)
      partnersWithDistance.sort((a, b) => a.distance - b.distance);
      
      return partnersWithDistance.slice(0, limit);
      
    } catch (error) {
      console.error('Error finding nearest partner:', error);
      return [];
    }
  }
  
  // Assign best delivery partner for an order
  async assignDeliveryPartner(orderId, restaurantLocation) {
    try {
      const nearestPartners = await this.findNearestPartner(restaurantLocation, 1);
      
      if (nearestPartners.length === 0) {
        return {
          success: false,
          message: 'No delivery partners available at the moment'
        };
      }
      
      const selectedPartner = nearestPartners[0];
      
      // Update partner's current orders
      await DeliveryPartner.findByIdAndUpdate(selectedPartner._id, {
        $inc: { currentOrders: 1 }
      });
      
      // Calculate estimated delivery time
      const estimatedTime = Math.ceil(selectedPartner.distance * 2 + 20); // 2 min per km + 20 min prep
      
      return {
        success: true,
        deliveryPartner: {
          id: selectedPartner._id,
          name: selectedPartner.name,
          phone: selectedPartner.phone,
          distance: selectedPartner.distance,
          estimatedTime: estimatedTime,
          vehicleType: selectedPartner.vehicleType,
          rating: selectedPartner.rating
        }
      };
      
    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
  // Update partner location
  async updateLocation(partnerId, lat, lng) {
    try {
      await DeliveryPartner.findByIdAndUpdate(partnerId, {
        currentLocation: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  // Update partner availability
  async updateAvailability(partnerId, isAvailable) {
    try {
      await DeliveryPartner.findByIdAndUpdate(partnerId, { isAvailable });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  // Complete delivery
  async completeDelivery(partnerId, orderId) {
    try {
      await DeliveryPartner.findByIdAndUpdate(partnerId, {
        $inc: { currentOrders: -1, totalDeliveries: 1 }
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new DeliveryAssignmentService();