const webPush = require("../config/webPush");
const Subscription = require("../models/subscription");

webPush.setVapidDetails(
  "mailto:kahuraisaac30@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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
