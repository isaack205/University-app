// Imports
const AuditLog = require('../models/auditLog');

// Get all audit logs with pagination, filters, and search
exports.getAuditLogs = async (req, res) => {
  try {
    const { category, severity, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (severity && severity !== 'ALL') {
      query.severity = severity;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { userName: searchRegex },
        { userEmail: searchRegex },
        { action: searchRegex },
        { ipAddress: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching system audit logs', error: error.message });
  }
};

// Get threat radar stats and anomaly summaries for Super Admin Dashboard
exports.getAuditStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalToday, criticalToday, warningsToday, recentThreats] = await Promise.all([
      AuditLog.countDocuments({ createdAt: { $gte: startOfToday } }),
      AuditLog.countDocuments({ createdAt: { $gte: startOfToday }, severity: 'CRITICAL' }),
      AuditLog.countDocuments({ createdAt: { $gte: startOfToday }, severity: 'WARNING' }),
      AuditLog.find({ severity: { $in: ['WARNING', 'CRITICAL'] } })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      stats: {
        totalToday,
        criticalToday,
        warningsToday,
        systemStatus: criticalToday > 0 ? 'ATTENTION_REQUIRED' : 'HEALTHY'
      },
      recentThreats
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ message: 'Error fetching audit statistics', error: error.message });
  }
};
