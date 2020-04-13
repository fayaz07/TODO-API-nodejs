const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        min: 5,
        unique: true,
    },
    created_on: {
        type: Date,
        default: Date.now,
    },
    additional_data: {
        type: Map
    }
})

module.exports = mongoose.model('user', userSchema);