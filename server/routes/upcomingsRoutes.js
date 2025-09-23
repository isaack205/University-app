// Imports
const express = require('express');
const { getUpcomingItems } = require('../controllers/upcomingsController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, authorize(['student', 'classRep']), getUpcomingItems);

module.exports = router;
