// Import
const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:kahuraisaac30@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Export
module.exports = webpush;
