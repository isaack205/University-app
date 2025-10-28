// Imports
const mongoose = require('mongoose');

// Delivery model
const deliveryLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    method: { type: String, enum: ['app', 'sms', 'push'], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['sent', 'failed', 'delivered'], default: 'sent' },
    type: { type: String, enum: ['assignment', 'event', 'schedule', 'class', 'emergency'], required: true },
    timestamp: { type: Date, default: Date.now },
    error: String
});

// Export
module.exports = mongoose.model('DeliveryLog', deliveryLogSchema);
