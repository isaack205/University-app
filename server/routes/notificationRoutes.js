const express = require('express');
const { triggerRemindersManually, createNotification, markAllNotificationsAsRead, getMyNotifications, deleteNotification, saveSubscription, toggleNotifications, sendTestNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, createNotification);
router.get('/', protect, getMyNotifications);
router.patch('/mark-all-read', protect, markAllNotificationsAsRead)
router.post('/trigger/reminders', protect, authorize(['admin']), triggerRemindersManually);
router.delete('/:id', protect, deleteNotification);
router.post('/push/subscribe', protect, saveSubscription);
router.put('/toggle', protect, toggleNotifications);
router.post('/push/test', protect, sendTestNotification);

module.exports = router;
