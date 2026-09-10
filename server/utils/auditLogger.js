// Imports
const AuditLog = require('../models/auditLog');

/**
 * Log a system activity and perform automated security anomaly checks
 */
const logActivity = async ({
  user = null,
  action,
  category = 'AUTH',
  severity = 'INFO',
  details = {},
  req = null,
}) => {
  try {
    let ipAddress = 'Unknown IP';
    let userAgent = 'Unknown Device';

    if (req) {
      ipAddress =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        'Unknown IP';

      userAgent = req.headers['user-agent'] || 'Unknown Device';
    }

    let finalSeverity = severity;

    // --- Anomaly Rule 1: Failed Login Spikes (3+ failed attempts in 10 mins) ---
    if (action === 'LOGIN_FAILED') {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentFailedCount = await AuditLog.countDocuments({
        action: 'LOGIN_FAILED',
        $or: [
          { ipAddress },
          { userEmail: user?.email || details?.email }
        ],
        createdAt: { $gte: tenMinsAgo }
      });

      if (recentFailedCount >= 2) {
        finalSeverity = 'CRITICAL';
        details.anomalyNotice = '🚨 Spiked failed logins detected! Possible password attempt / brute-force alert.';
      }
    }

    // --- Anomaly Rule 2: Off-Hours Admin Actions (12:00 AM to 5:00 AM) ---
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 4 && (category === 'SECURITY' || category === 'ADMIN')) {
      if (finalSeverity !== 'CRITICAL') finalSeverity = 'WARNING';
      details.offHoursNotice = '🌙 Administrative action performed during off-hours (12:00 AM - 5:00 AM).';
    }

    // --- Anomaly Rule 3: High-level Role Elevation ---
    if (action === 'ROLE_ELEVATED' && details?.newRole === 'admin') {
      finalSeverity = 'CRITICAL';
      details.securityNotice = '⚡ User elevated to Admin access!';
    }

    const logEntry = new AuditLog({
      user: user?._id || user?.id || null,
      userName: user?.name || details?.name || 'Guest/System',
      userEmail: user?.email || details?.email || null,
      userRole: user?.role || 'student',
      action,
      category,
      severity: finalSeverity,
      ipAddress,
      userAgent,
      details,
    });

    await logEntry.save();
    return logEntry;
  } catch (err) {
    console.error('Audit Logger Error:', err.message);
  }
};

module.exports = logActivity;
