// Imports
const express = require('express');
const { getUpcomingItems } = require('../controllers/upcomingsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, authorize('student'), getUpcomingItems);

module.exports = router;
