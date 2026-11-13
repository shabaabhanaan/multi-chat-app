const express = require('express');
const router = express.Router();
const { getUsers, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserProfile);

module.exports = router;
