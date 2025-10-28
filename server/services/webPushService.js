const webPush = require("../config/webPush");
const Subscription = require("../models/subscription");

exports.sendPushNotification = async (userId, payload) => {
  try {
    const subscriptions = await Subscription.find({ user: userId });

    for (const sub of subscriptions) {
      await webPush.sendNotification(sub, JSON.stringify(payload));
    }
  } catch (error) {
    console.error("Push notification failed:", error.message);
  }
};
