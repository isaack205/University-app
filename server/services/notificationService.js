const Notification = require('../models/notification');
const DeliveryLog = require('../models/delivery');
const { sendPushNotification } = require('./webPushService')

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

    // Fetch user's push subscriptions
    const subscriptions = await Subscription.find({ user: userId });
    if (!subscriptions.length) {
      console.log(`ℹ️ No push subscription found for user ${userId}`);
    }

    //  Attempt to send push notification(s)
    for (const sub of subscriptions) {
      try {
        await sendPushNotification(sub, { title: 'New Notification', body: message, type });
        await DeliveryLog.create({
          user: userId,
          method: 'push',
          message,
          type,
          status: 'delivered',
        });
      } catch (pushErr) {
        console.error(`❌ Push failed for user ${userId}:`, pushErr.message);
        await DeliveryLog.create({
          user: userId,
          method: 'push',
          message,
          type,
          status: 'failed',
          error: pushErr.message,
        });
      }
    }

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
