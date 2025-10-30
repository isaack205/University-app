// Imports
const express = require('express')
const router = express.Router();
const { getDashboardSummary } = require('../controllers/adminDashboardController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/dashboard/summary', protect, authorize(['admin']), getDashboardSummary);

module.exports = router;