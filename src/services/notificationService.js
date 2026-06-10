const Notification = require('../models/Notification');
const { sendOrderUpdate } = require('../config/socket');

class NotificationService {
  
  // Create and send notification
  async sendNotification(userId, orderId, title, message, type = 'order_update') {
    try {
      // Save to database
      const notification = await Notification.create({
        userId,
        orderId,
        title,
        message,
        type
      });
      
      // Send real-time via WebSocket
      sendOrderUpdate(orderId, userId, title, {
        message,
        type,
        notificationId: notification._id,
        timestamp: new Date()
      });
      
      console.log(`📧 Notification sent to user ${userId}: ${title}`);
      return notification;
      
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }
  
  // Get user's notifications
  async getUserNotifications(userId, limit = 50, offset = 0) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
      
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });
      
      return { notifications, unreadCount };
    } catch (error) {
      console.error('Error getting notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  }
  
  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking as read:', error);
      return null;
    }
  }
  
  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }
  
  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, userId });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
  
  // Order status update notifications
  async notifyOrderStatusChange(order, oldStatus, newStatus) {
    const statusMessages = {
      'confirmed': '✅ Your order has been confirmed by the restaurant!',
      'preparing': '🍳 Your order is being prepared!',
      'out_for_delivery': '🛵 Your order is out for delivery!',
      'delivered': '🎉 Your order has been delivered! Enjoy your meal!',
      'cancelled': '❌ Your order has been cancelled.'
    };
    
    const titles = {
      'confirmed': 'Order Confirmed',
      'preparing': 'Food Being Prepared',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Order Delivered',
      'cancelled': 'Order Cancelled'
    };
    
    if (statusMessages[newStatus]) {
      await this.sendNotification(
        order.userId,
        order._id,
        titles[newStatus],
        statusMessages[newStatus],
        'order_update'
      );
    }
  }
}

module.exports = new NotificationService();