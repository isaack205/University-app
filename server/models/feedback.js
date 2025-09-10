// Imports
const mongoose = require('mongoose');

// Feddback model
const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['issue', 'suggestion'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  adminNote: String
});

// Export
module.exports = mongoose.model('Feedback', feedbackSchema);
