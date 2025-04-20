const socketIO = require('socket.io');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: ['http://localhost:3000', 'https://projectnexus-frontend.vercel.app'],
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  // Store active rooms and users
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a collaboration room
    socket.on('join-room', ({ roomId, projectId, user }) => {
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          projectId,
          users: [],
          code: '// Start coding here...',
        });
      }
      
      // Add user to the room
      const room = rooms.get(roomId);
      const roomUser = {
        id: socket.id,
        name: user?.name || 'Anonymous',
        avatar: user?.avatar || null,
        userId: user?.id || null,
      };
      
      room.users.push(roomUser);
      
      // Notify everyone about the new user
      io.to(roomId).emit('users-update', room.users);
      
      // Send current code to the new user
      socket.emit('code-change', room.code);
      
      // Welcome message
      io.to(roomId).emit('new-message', {
        sender: 'System',
        text: `${roomUser.name} has joined the room`,
      });
    });

    // Handle code changes
    socket.on('code-change', ({ roomId, code }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.code = code;
        
        // Broadcast to everyone except sender
        socket.to(roomId).emit('code-change', code);
      }
    });

    // Handle chat messages
    socket.on('send-message', ({ roomId, message }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        const user = room.users.find(u => u.id === socket.id);
        
        io.to(roomId).emit('new-message', {
          sender: user?.name || 'Anonymous',
          text: message,
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove user from all rooms
      rooms.forEach((room, roomId) => {
        const userIndex = room.users.findIndex(u => u.id === socket.id);
        
        if (userIndex !== -1) {
          const user = room.users[userIndex];
          room.users.splice(userIndex, 1);
          
          // Notify others
          io.to(roomId).emit('users-update', room.users);
          io.to(roomId).emit('new-message', {
            sender: 'System',
            text: `${user.name} has left the room`,
          });
          
          // Clean up empty rooms
          if (room.users.length === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  return io;
};

module.exports = initializeSocket;