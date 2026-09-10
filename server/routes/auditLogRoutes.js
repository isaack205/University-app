// Imports
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { getAuditLogs, getAuditStats } = require('../controllers/auditLogController');

// All audit endpoints require Admin authentication
router.get('/', protect, authorize(['admin']), getAuditLogs);
router.get('/stats', protect, authorize(['admin']), getAuditStats);

module.exports = router;
