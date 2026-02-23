const socketHandler = (io) => {
  console.log('Socket handler initialized');

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User with ID: ${socket.id} joined room: ${chatId}`);
    });

    // Leave a specific chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      console.log(`User with ID: ${socket.id} left room: ${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
