const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');

router.get('/:roomId', getMessages);
router.post('/send', sendMessage);

module.exports = router;
