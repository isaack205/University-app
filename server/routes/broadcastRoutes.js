// Imports
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { sendBroadcast, searchUsersForBroadcast } = require('../controllers/broadcastController');

// All broadcast endpoints require Admin authentication
router.post('/send', protect, authorize(['admin']), sendBroadcast);
router.get('/search-users', protect, authorize(['admin']), searchUsersForBroadcast);

module.exports = router;
