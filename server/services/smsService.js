const SMS = require('../config/smsConfig');
const DeliveryLog = require('../models/delivery');

exports.sendSMS = async (userId, phoneNumber, message, type) => {
  try {
    await SMS.send({ to: [phoneNumber], message });
    await DeliveryLog.create({ user: userId, method: 'sms', message, type });
  } catch (err) {
    await DeliveryLog.create({ user: userId, method: 'sms', message, type, status: 'failed', error: err.message });
    console.error('SMS error:', err.message);
  }
};
