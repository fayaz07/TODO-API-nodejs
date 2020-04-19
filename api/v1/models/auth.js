const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        min: 5,
        unique: true,
    },
    provider: String,
    refresh_token: {
        type: String
    },
    additional_data: {
        type: Map
    }
}, { timestamps: true })

module.exports = mongoose.model('auth', userSchema);