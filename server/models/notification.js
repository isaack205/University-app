// Imports
const mongoose = require('mongoose');

// Notification model
const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['assignment', 'event', 'schedule', 'class', 'emergency'],
        required: true
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Export
module.exports = mongoose.model('Notification', notificationSchema);
