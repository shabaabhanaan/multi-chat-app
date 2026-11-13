const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        isDirectMessage: {
            type: Boolean,
            default: false,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        avatar: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Room', roomSchema);
