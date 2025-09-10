const africastalking = require('africastalking')({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
});

const sms = africastalking.SMS;

exports.send = async ({ to, message }) => {
  try {
    const response = await sms.send({ to, message });
    return response;
  } catch (err) {
    throw new Error('SMS sending failed: ' + err.message);
  }
};
