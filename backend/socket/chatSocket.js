const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

const chatSocket = (io) => {
    // Map of userId -> Set of socketIds
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        let currentUserId = null;

        // User setup / authentication on socket
        socket.on('setup', async (userData) => {
            if (!userData || !userData._id) return;
            currentUserId = userData._id.toString();
            socket.userId = currentUserId;

            if (!onlineUsers.has(currentUserId)) {
                onlineUsers.set(currentUserId, new Set());
            }
            onlineUsers.get(currentUserId).add(socket.id);

            try {
                await User.findByIdAndUpdate(currentUserId, {
                    isOnline: true,
                    lastActive: new Date(),
                });
            } catch (err) {
                console.error('Error updating user online status:', err.message);
            }

            // Broadcast current online user IDs
            io.emit('online_users', Array.from(onlineUsers.keys()));
            socket.emit('connected');
        });

        // Join room
        socket.on('join_room', (roomId) => {
            if (!roomId) return;
            socket.join(roomId);
        });

        // Leave room
        socket.on('leave_room', (roomId) => {
            if (!roomId) return;
            socket.leave(roomId);
        });

        // Typing indicator
        socket.on('typing', ({ roomId, username, userId }) => {
            if (!roomId) return;
            socket.to(roomId).emit('user_typing', { roomId, username, userId });
        });

        socket.on('stop_typing', ({ roomId, userId }) => {
            if (!roomId) return;
            socket.to(roomId).emit('user_stop_typing', { roomId, userId });
        });

        // Real-time message sending
        socket.on('send_message', async (messageData) => {
            try {
                const { roomId, senderId, content, fileUrl, fileType, fileName, fileSize } = messageData;

                if (!roomId || !senderId) return;

                // Create message in database
                const newMessage = await Message.create({
                    sender: senderId,
                    room: roomId,
                    content: content || '',
                    fileUrl: fileUrl || null,
                    fileType: fileType || null,
                    fileName: fileName || null,
                    fileSize: fileSize || null,
                });

                // Update room lastMessage
                await Room.findByIdAndUpdate(roomId, {
                    lastMessage: newMessage._id,
                    updatedAt: new Date(),
                });

                const populatedMessage = await Message.findById(newMessage._id).populate(
                    'sender',
                    'username avatar status isOnline'
                );

                // Broadcast message to everyone in the room (including sender)
                io.to(roomId).emit('message_received', populatedMessage);
            } catch (error) {
                console.error('Socket send_message error:', error);
                socket.emit('message_error', { error: error.message });
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            if (currentUserId && onlineUsers.has(currentUserId)) {
                const userSockets = onlineUsers.get(currentUserId);
                userSockets.delete(socket.id);

                if (userSockets.size === 0) {
                    onlineUsers.delete(currentUserId);
                    try {
                        await User.findByIdAndUpdate(currentUserId, {
                            isOnline: false,
                            lastActive: new Date(),
                        });
                    } catch (err) {
                        console.error('Error updating user offline status:', err.message);
                    }
                    io.emit('online_users', Array.from(onlineUsers.keys()));
                }
            }
        });
    });
};

module.exports = chatSocket;
