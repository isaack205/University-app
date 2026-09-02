// Imports
const mongoose = require('mongoose');

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  userName: {
    type: String,
    default: 'Anonymous/Guest',
  },
  userEmail: {
    type: String,
    default: null,
  },
  userRole: {
    type: String,
    default: 'student',
  },
  action: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['SECURITY', 'ACADEMICS', 'ADMIN', 'AUTH'],
    default: 'AUTH',
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO',
  },
  ipAddress: {
    type: String,
    default: 'Unknown IP',
  },
  userAgent: {
    type: String,
    default: 'Unknown Device',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000, // Auto-delete logs after 90 days (90 * 24 * 3600 seconds)
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
