const User = require('../models/User');

// @desc    Get all users (with optional search)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    try {
        const query = {
            username: { $exists: true, $nin: [null, ''] },
            _id: { $ne: req.user._id },
        };

        if (req.query.search && req.query.search.trim()) {
            query.$or = [
                { username: { $regex: req.query.search.trim(), $options: 'i' } },
                { email: { $regex: req.query.search.trim(), $options: 'i' } },
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ isOnline: -1, username: 1 });

        res.json(users);
    } catch (error) {
        console.error('getUsers error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserProfile,
};
