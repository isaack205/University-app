// Imports
const mongoose = require('mongoose');

// Feddback model
const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  guestName: { type: String, required: false },
  guestEmail: { type: String, required: false },
  type: { type: String, enum: ['bug', 'feature', 'class_rep_elevation', 'course_request', 'general', 'issue', 'suggestion', 'other'], default: 'other' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  subject: { type: String, required: false },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  adminNote: String
});

// Export
module.exports = mongoose.model('Feedback', feedbackSchema);
