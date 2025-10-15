const { runReminders } = require('../services/reminderService');
const Notification = require('../models/notification')

exports.triggerRemindersManually = async (req, res) => {
  try {
    await runReminders();
    res.status(200).json({ message: 'Reminders triggered manually' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to trigger reminders', error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    const notification = await Notification.create({
      user: userId,
      message,
      type,
      timestamp: new Date()
    });

    res.status(201).json({ message: 'Notification created', notification });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create notification', error: err.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    // Find and update all unread notifications for the current user
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({ message: "All notifications marked as read.", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error marking notifications as read:", error.message);
    return res.status(500).json({ message: "Failed to mark notifications as read.", error: error.message });
  }
};


exports.getMyNotifications = async (req, res) => {
  try {
    const user = req.user;

    const notifications = await Notification.find({ user: user._id }).sort({ read: 1, createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification', error: err.message });
  }
};