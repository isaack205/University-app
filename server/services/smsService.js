const africastalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

const DeliveryLog = require('../models/delivery');

const sms = africastalking.SMS;

exports.sendSMS = async (userId, phoneNumber, message, type= 'emergency') => {
  try {
    const response = await sms.send({ to: [phoneNumber], message });

    const recipient = response.SMSMessageData.Recipients[0];

    await DeliveryLog.create({
      user: userId,
      method: 'sms',
      message,
      type,
      status: recipient.status === 'Success' ? 'sent' : 'failed',
      statusCode: recipient.statusCode,
      messageId: recipient.messageId,
      cost: recipient.cost,
      timestamp: new Date()
    });

    console.log(`✅ SMS sent to ${phoneNumber}: ${recipient.status}`);
  } catch (err) {
    await DeliveryLog.create({
      user: userId,
      method: 'sms',
      message,
      type,
      status: 'failed',
      error: err.message,
      timestamp: new Date()
    });

    console.error(`❌ SMS failed to ${phoneNumber}:`, err.message);
  }
};
