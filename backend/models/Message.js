const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
            index: true,
        },
        content: {
            type: String,
            default: '',
            trim: true,
        },
        fileUrl: {
            type: String,
            default: null,
        },
        fileType: {
            type: String,
            enum: ['image', 'file', null],
            default: null,
        },
        fileName: {
            type: String,
            default: null,
        },
        fileSize: {
            type: Number,
            default: null,
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Message', messageSchema);
