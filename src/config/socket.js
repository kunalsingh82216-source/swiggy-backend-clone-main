const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    // Join user's personal room
    socket.on('join-user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`📱 User ${userId} joined room`);
    });
    
    // Join order room
    socket.on('join-order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`📦 Order ${orderId} joined room`);
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
  
  return io;
};

const sendOrderUpdate = (orderId, userId, status, details = {}) => {
  if (!io) return;
  
  const eventData = {
    orderId,
    status,
    details,
    timestamp: new Date()
  };
  
  // Send to order room
  io.to(`order_${orderId}`).emit('order-status-update', eventData);
  
  // Send to user room
  io.to(`user_${userId}`).emit('notification', {
    title: `Order ${status}`,
    message: details.message,
    orderId
  });
  
  console.log(`📡 Real-time update sent for order ${orderId}: ${status}`);
};

module.exports = { initializeSocket, sendOrderUpdate };