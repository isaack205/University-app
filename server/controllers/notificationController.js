// Imports
const { runReminders } = require('../services/reminderService');
const Notification = require('../models/notification');
const Subscription = require("../models/subscription");
const User = require("../models/user");
const webpush = require("../config/webPush");

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

// Save user's push subscription
exports.saveSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user._id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if user has notifications enabled
    if (!user.notificationsEnabled) {
      return res.status(403).json({ message: "Notifications are disabled for this user." });
    }

    // Validate subscription payload
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ message: "Invalid subscription data." });
    }

    // Upsert (update if exists, otherwise create)
    const updatedSub = await Subscription.findOneAndUpdate(
      { user: userId, endpoint: subscription.endpoint },
      {
        user: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: "Subscription saved successfully.",
      subscription: updatedSub,
    });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return res.status(500).json({
      message: "Failed to save subscription.",
      error: error.message,
    });
  }
};

// Toggle notifications on/off
exports.toggleNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notificationsEnabled = !user.notificationsEnabled;
    await user.save();

    res.status(200).json({
      message: `Notifications ${user.notificationsEnabled ? "enabled" : "disabled"} successfully.`,
      status: user.notificationsEnabled,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle notifications." });
  }
};

// Send test push notification (optional)
exports.sendTestNotification = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id });

    for (const sub of subscriptions) {
      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: "🔔 Test Notification",
          body: "Push notifications are working!",
          type: 'emergency',
          icon: "/icons/maskable_icon_x192.png",
          url: "/notifications"
        })
      );
    }

    res.status(200).json({ message: "Test notification sent!" });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ message: "Failed to send notification." });
  }
};
