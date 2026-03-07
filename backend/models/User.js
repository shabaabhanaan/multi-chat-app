
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name : {
        type: String,
        requierd: TextTrackCue
    },
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        requireed: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    Date : {
        type: Date,
        default: Date.now
    }
})
module.experts = mongoose.module('User', userSchema) 