// Imports
const mongoose = require('mongoose');

// Notification model
const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['assignment', 'event', 'schedule', 'class', 'emergency', 'CAT', 'document', 'role_update'],
        required: true
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: false },
    expiresAt: { type: Date },
    reminderType: { type: String }
}, {
    timestamps: true
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Export
module.exports = mongoose.model('Notification', notificationSchema);
