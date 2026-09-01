// Imports
const express = require('express')
const router = express.Router();
const { getDashboardSummary, getFeedbackSummary, getDeliveryStats, getRecentUserActivity } = require('../controllers/adminDashboardController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/dashboard/summary', protect, authorize(['admin']), getDashboardSummary);
router.get('/dashboard/recent-activity', protect, authorize(['admin']), getRecentUserActivity);
router.get('/dashboard/feedback-summary', protect, authorize(['admin']), getFeedbackSummary);
router.get('/dashboard/delivery-stats', protect, authorize(['admin']), getDeliveryStats);

module.exports = router;