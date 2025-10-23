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
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
  preferences: {
    smsNotifications: { type: Boolean, default: false },
    offlineMode: { type: Boolean, default: false }
  },
  notificationsEnabled: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);