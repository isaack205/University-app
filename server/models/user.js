// Imports
const mongoose = require('mongoose');

// Base User Schema Options
const options = {
  discriminatorKey: 'role',
  timestamps: true,
};

// Base User Schema (shared fields across all user types)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  preferences: {
    smsNotifications: { type: Boolean, default: false },
    offlineMode: { type: Boolean, default: false }
  },
  notificationsEnabled: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: null },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, options);

// Base Model
const User = mongoose.model('User', userSchema);

// Student Discriminator Schema (Students & ClassReps)
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
});

// Admin Discriminator Schema (Admins only - no course or cohort)
const adminSchema = new mongoose.Schema({
  adminId: { type: String, unique: true, sparse: true },
});

// Create Discriminators using role values
const Student = User.discriminator('student', studentSchema);
const ClassRep = User.discriminator('classRep', studentSchema);
const Admin = User.discriminator('admin', adminSchema);

module.exports = {
  User,
  Student,
  ClassRep,
  Admin,
};