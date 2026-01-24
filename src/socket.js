const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const chatService = require('./services/chat.service');

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                process.env.CLIENT_URL,
                'http://localhost:3000',
                'http://localhost:5001',
                'https://book-worm-front-end.vercel.app'
            ],
            credentials: true
        }
    });

    // JWT Authentication for Sockets
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication error: Token missing'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    const onlineUsers = new Map(); // userId -> socketId

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        onlineUsers.set(userId, socket.id);

        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // Join a conversion room
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${userId} joined room: ${conversationId}`);
        });

        // Send a private message
        socket.on('send_message', async (data) => {
            const { conversationId, text, recipientId } = data;

            try {
                // Save to database
                const message = await chatService.saveMessage(conversationId, userId, text);

                // Broadcast to the room (both users if joined)
                io.to(conversationId).emit('receive_message', message);

                // Also notify recipient if they are online but not in the room (for notifications)
                const recipientSocketId = onlineUsers.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('new_notification', {
                        type: 'CHAT_MESSAGE',
                        sender: {
                            id: userId,
                            name: socket.user.name,
                            photo: socket.user.photo
                        },
                        text,
                        conversationId
                    });
                }
            } catch (error) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indication
        socket.on('typing', (data) => {
            const { conversationId, recipientId } = data;
            const recipientSocketId = onlineUsers.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user_typing', { conversationId });
            }
        });

        // Mark messages as read
        socket.on('mark_messages_read', (data) => {
            const { conversationId } = data;
            // Broadcast to room that messages are read
            io.to(conversationId).emit('messages_read', { conversationId });
        });

        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = initializeSocket;
