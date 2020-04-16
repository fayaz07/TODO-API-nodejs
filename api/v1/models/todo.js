const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    completed_on: {
        type: Date,
    },
    due_on: {
        type: Date,
    },
    /*    created_on: {
            type: Date,
            default: Date.now
        },
    */
    status: {
        type: String,
        default: 'Pending'
    },
    removed: {
        type: Boolean,
        default: false
    },
    additional_data: {
        type: Map
    }
}, { timestamps: true })

module.exports = mongoose.model('todo', todoSchema);