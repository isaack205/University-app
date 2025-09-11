const express = require('express');
const { triggerRemindersManually, createNotification, getMyNotifications, deleteNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, createNotification);
router.get('/', protect, getMyNotifications);
router.post('/trigger/reminders', protect, authorize(['admin']), triggerRemindersManually);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
