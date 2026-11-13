const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// @desc Upload a file/media
// @route POST /api/upload
// @access Private
router.post('/', protect, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const isImage = req.file.mimetype.startsWith('image/');
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            fileUrl,
            fileName: req.file.originalname,
            fileType: isImage ? 'image' : 'file',
            fileSize: req.file.size,
            mimetype: req.file.mimetype,
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

