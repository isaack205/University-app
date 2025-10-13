const Notification = require('../models/notification');
const DeliveryLog = require('../models/delivery');

exports.sendAppNotification = async (userId, message, type, referenceId = null, expiresAt = null, reminderType = null ) => {
  try {
    // Prevent duplicate 24h and 48h reminders
    if (reminderType === '24h' || reminderType === '48h') {
      const exists = await Notification.findOne({
        user: userId,
        referenceId,
        type,
        reminderType
      });

      if (exists) {
        console.log(`⚠️ Duplicate ${reminderType} reminder ignored for user ${userId}`);
        return;
      }
    }

    await Notification.create({ user: userId, message, type, referenceId, expiresAt, reminderType });

    await DeliveryLog.create({ user: userId, method: 'app', message, type });
  } catch (err) {
    if (err.code === 11000) {
      console.log(`⚠️ Duplicate ${reminderType || type} notification ignored`);
    } else {
      await DeliveryLog.create({ user: userId, method: 'app', message, type, status: 'failed', error: err.message });
    }

    console.error('App notification error:', err.message);
  }
};
