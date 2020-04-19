const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        unique: true,
    },
    pp: String,

}, { timestamps: true })

module.exports = mongoose.model('user', userSchema);