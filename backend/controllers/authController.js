const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validateEmail } = require('../utils/validators');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { username, email, password, avatar, bio, status } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide username, email, and password' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user exists
        const userExists = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
        });

        if (userExists) {
            if (userExists.email.toLowerCase() === email.toLowerCase()) {
                return res.status(400).json({ message: 'Email is already registered' });
            }
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Create user
        const user = await User.create({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password,
            avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
            bio: bio || 'Hey there! I am using Multi-Chat.',
            status: status || 'Online',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                status: user.status,
                isOnline: user.isOnline,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: 'Please provide email/username and password' });
        }

        const trimmed = emailOrUsername.trim();
        const user = await User.findOne({
            $or: [
                { email: trimmed.toLowerCase() },
                { username: new RegExp(`^${trimmed}$`, 'i') },
            ],
        });

        if (user && (await user.matchPassword(password))) {
            user.isOnline = true;
            user.lastActive = new Date();
            await user.save();

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                status: user.status,
                isOnline: true,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username, avatar, bio, status } = req.body;

        if (username && username.trim() !== user.username) {
            const existing = await User.findOne({ username: username.trim() });
            if (existing && existing._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            user.username = username.trim();
        }

        if (avatar !== undefined) user.avatar = avatar;
        if (bio !== undefined) user.bio = bio;
        if (status !== undefined) user.status = status;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            status: updatedUser.status,
            isOnline: updatedUser.isOnline,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
};
