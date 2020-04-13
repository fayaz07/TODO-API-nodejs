const mongoose = require('mongoose');
require('dotenv').config();

const usageSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
    },
    keys: {
        type: Array,
        default: []
    },
    requests_limit_per_month: {
        type: Number,
        default: process.env.DEFAULT_REQUEST_LIMIT
    },
    requests_this_month: {
        type: Number,
        default: 0
    },
    requests_total: {
        type: Number,
        default: 0
    },
    last_request_on: {
        type: Date,
        default: Date.now
    },
    additional_data: {
        type: Map
    }
})

module.exports = mongoose.model('api_usage', usageSchema);