// Import
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
});

subscriptionSchema.index({ user: 1, endpoint: 1 }, { unique: true });

// Export
module.exports = mongoose.model("Subscription", subscriptionSchema);
