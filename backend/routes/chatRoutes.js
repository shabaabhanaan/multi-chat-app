const express = require('express');
const router = express.Router();
const {
    getRooms,
    createRoom,
    getOrCreateDM,
    getMessages,
    sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.post('/dm', getOrCreateDM);
router.get('/messages/:roomId', getMessages);
router.post('/messages', sendMessage);

module.exports = router;
