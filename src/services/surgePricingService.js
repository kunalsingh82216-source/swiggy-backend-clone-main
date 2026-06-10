const SurgeSetting = require('../models/SurgeSetting');
const Order = require('../models/Order');

class SurgePricingService {
  
  // Get current surge multiplier based on time
  async getCurrentMultiplier() {
    try {
      const settings = await SurgeSetting.findOne();
      if (!settings || !settings.isEnabled) return 1.0;
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check lunch peak (12:00 - 15:00)
      if (currentHour >= 12 && currentHour < 15) {
        console.log(`🍽️ Lunch peak hours: ${settings.peakHours.lunch.multiplier}x surge`);
        return settings.peakHours.lunch.multiplier;
      }
      
      // Check dinner peak (19:00 - 22:00)
      if (currentHour >= 19 && currentHour < 22) {
        console.log(`🌙 Dinner peak hours: ${settings.peakHours.dinner.multiplier}x surge`);
        return settings.peakHours.dinner.multiplier;
      }
      
      // Check morning peak (08:00 - 10:00)
      if (currentHour >= 8 && currentHour < 10) {
        console.log(`☀️ Morning peak hours: ${settings.peakHours.morning.multiplier}x surge`);
        return settings.peakHours.morning.multiplier;
      }
      
      return 1.0;
      
    } catch (error) {
      console.error('Error getting multiplier:', error);
      return 1.0;
    }
  }
  
  // Calculate delivery fee with surge
  async calculateDeliveryFee(distance = 5) {
    try {
      const settings = await SurgeSetting.findOne();
      const multiplier = await this.getCurrentMultiplier();
      
      const baseFee = settings?.baseDeliveryFee || 40;
      const freeDistance = settings?.freeDeliveryDistance || 3;
      const perKmFee = settings?.distanceFeePerKm || 10;
      
      // Calculate distance fee
      let distanceFee = 0;
      if (distance > freeDistance) {
        distanceFee = (distance - freeDistance) * perKmFee;
      }
      
      // Calculate total with surge
      const totalFee = (baseFee + distanceFee) * multiplier;
      const finalFee = Math.round(totalFee);
      
      return {
        baseFee,
        distanceFee,
        surgeMultiplier: multiplier,
        totalDeliveryFee: finalFee,
        isSurgeActive: multiplier > 1,
        peakHourName: await this.getPeakHourName()
      };
      
    } catch (error) {
      console.error('Error calculating fee:', error);
      return {
        baseFee: 40,
        distanceFee: 0,
        surgeMultiplier: 1,
        totalDeliveryFee: 40,
        isSurgeActive: false,
        peakHourName: null
      };
    }
  }
  
  // Get peak hour name
  async getPeakHourName() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 12 && hour < 15) return 'Lunch Peak';
    if (hour >= 19 && hour < 22) return 'Dinner Peak';
    if (hour >= 8 && hour < 10) return 'Morning Peak';
    return null;
  }
  
  // Get current surge settings (for admin)
  async getSettings() {
    let settings = await SurgeSetting.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await SurgeSetting.create({});
    }
    return settings;
  }
  
  // Update surge settings (admin only)
  async updateSettings(updateData, userId) {
    const settings = await SurgeSetting.findOneAndUpdate(
      {},
      { ...updateData, updatedBy: userId, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    return settings;
  }
}

module.exports = new SurgePricingService();