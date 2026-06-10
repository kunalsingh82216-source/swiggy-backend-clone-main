const notificationService = require('../services/notificationService');

// Get user's notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const { notifications, unreadCount } = await notificationService.getUserNotifications(
      req.user.id,
      parseInt(limit),
      parseInt(offset)
    );
    
    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(id, req.user.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Marked as read', data: notification });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await notificationService.deleteNotification(id, req.user.id);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification deleted' });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { unreadCount } = await notificationService.getUserNotifications(req.user.id, 1, 0);
    res.json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};