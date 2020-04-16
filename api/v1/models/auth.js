const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        min: 5,
        unique: true,
    },
    /*
        // removing this field as timestamps is set to true,
        // createdAt will be used
        created_on: {
            type: Date,
            default: Date.now,
        },
    */
    additional_data: {
        type: Map
    }
}, { timestamps: true })

module.exports = mongoose.model('user', userSchema);