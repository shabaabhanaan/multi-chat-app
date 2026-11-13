const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

// Helper to seed default rooms
const ensureDefaultRooms = async () => {
    try {
        const count = await Room.countDocuments({ isDirectMessage: false });
        if (count === 0) {
            await Room.create([
                {
                    name: 'general',
                    description: 'General discussion for everyone',
                    isDirectMessage: false,
                },
                {
                    name: 'technology',
                    description: 'Tech talk, coding, gadgets, and software',
                    isDirectMessage: false,
                },
                {
                    name: 'random',
                    description: 'Casual watercooler chat and memes',
                    isDirectMessage: false,
                },
            ]);
            console.log('Default chat rooms seeded.');
        }
    } catch (err) {
        console.error('Error seeding default rooms:', err.message);
    }
};

// @desc    Get all rooms (channels + user's DMs)
// @route   GET /api/chat/rooms
// @access  Private
const getRooms = async (req, res) => {
    try {
        await ensureDefaultRooms();

        const rooms = await Room.find({
            $or: [
                { isDirectMessage: false },
                { isDirectMessage: true, members: req.user._id },
            ],
        })
            .populate('members', 'username avatar status bio isOnline lastActive')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username avatar',
                },
            })
            .sort({ updatedAt: -1 });

        res.json(rooms);
    } catch (error) {
        console.error('getRooms error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new channel/room
// @route   POST /api/chat/rooms
// @access  Private
const createRoom = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Room name is required' });
        }

        const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');

        const existing = await Room.findOne({
            name: cleanName,
            isDirectMessage: false,
        });

        if (existing) {
            return res.status(400).json({ message: 'A channel with this name already exists' });
        }

        const room = await Room.create({
            name: cleanName,
            description: description ? description.trim() : '',
            isDirectMessage: false,
            createdBy: req.user._id,
            members: [req.user._id],
        });

        await room.populate('members', 'username avatar status bio isOnline');

        res.status(201).json(room);
    } catch (error) {
        console.error('createRoom error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get or create 1-on-1 direct message room
// @route   POST /api/chat/dm
// @access  Private
const getOrCreateDM = async (req, res) => {
    try {
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ message: 'Target user ID is required' });
        }

        if (targetUserId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot start direct message with yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        // Look for existing DM room between these two members
        let room = await Room.findOne({
            isDirectMessage: true,
            members: { $all: [req.user._id, targetUserId], $size: 2 },
        })
            .populate('members', 'username avatar status bio isOnline lastActive')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username avatar',
                },
            });

        if (!room) {
            room = await Room.create({
                name: `${req.user.username} & ${targetUser.username}`,
                isDirectMessage: true,
                members: [req.user._id, targetUserId],
                createdBy: req.user._id,
            });

            room = await Room.findById(room._id).populate(
                'members',
                'username avatar status bio isOnline lastActive'
            );
        }

        res.json(room);
    } catch (error) {
        console.error('getOrCreateDM error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get message history for a room
// @route   GET /api/chat/messages/:roomId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { search } = req.query;

        const filter = { room: roomId };
        if (search && search.trim()) {
            filter.content = { $regex: search.trim(), $options: 'i' };
        }

        const messages = await Message.find(filter)
            .populate('sender', 'username avatar status isOnline')
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(messages);
    } catch (error) {
        console.error('getMessages error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message via REST
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { roomId, content, fileUrl, fileType, fileName, fileSize } = req.body;

        if (!roomId) {
            return res.status(400).json({ message: 'roomId is required' });
        }

        if (!content && !fileUrl) {
            return res.status(400).json({ message: 'Message content or file is required' });
        }

        const message = await Message.create({
            sender: req.user._id,
            room: roomId,
            content: content || '',
            fileUrl: fileUrl || null,
            fileType: fileType || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
        });

        await Room.findByIdAndUpdate(roomId, {
            lastMessage: message._id,
            updatedAt: new Date(),
        });

        const populated = await Message.findById(message._id).populate(
            'sender',
            'username avatar status isOnline'
        );

        res.status(201).json(populated);
    } catch (error) {
        console.error('sendMessage error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRooms,
    createRoom,
    getOrCreateDM,
    getMessages,
    sendMessage,
    ensureDefaultRooms,
};
