const Notification = require('../models/notification');
const DeliveryLog = require('../models/delivery');

exports.sendAppNotification = async (userId, message, type) => {
  try {
    await Notification.create({ user: userId, message, type });
     await DeliveryLog.create({ user: userId, method: 'app', message, type });
  } catch (err) {
    await DeliveryLog.create({ user: userId, method: 'app', message, type, status: 'failed', error: err.message });
    console.error('App notification error:', err.message);
  }
};
