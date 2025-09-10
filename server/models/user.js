// Imports
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'classRep', 'admin'], default: 'student' },
  course: { type: String },
  cohort: { type: String },
  preferences: {
    smsNotifications: { type: Boolean, default: true },
    offlineMode: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);