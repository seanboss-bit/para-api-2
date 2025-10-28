const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming you have a User/Admin model
      required: true,
    },
    endpoint: { 
      type: String, 
      required: true 
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    // New fields for tracking and debugging
    userAgent: {
      type: String,
      default: null,
    },
    expirationTime: {
      type: Date,
      default: null,
    },
    lastSent: {
      type: Date,
      default: null,
    },
    lastRenewed: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

// Prevent duplicate subscriptions for same admin and endpoint
pushSubscriptionSchema.index({ adminId: 1, endpoint: 1 }, { unique: true });

// Index for cleanup queries (optional but recommended)
pushSubscriptionSchema.index({ lastSent: 1 });
pushSubscriptionSchema.index({ createdAt: 1 });

// Virtual to check if subscription might be stale (older than 30 days)
pushSubscriptionSchema.virtual("isStale").get(function() {
  if (!this.lastRenewed && !this.createdAt) return false;
  const lastActivity = this.lastRenewed || this.createdAt;
  const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceActivity > 30;
});

// Method to check if subscription is from mobile
pushSubscriptionSchema.methods.isMobile = function() {
  if (!this.userAgent) return false;
  return /Mobile|Android|iPhone|iPad|iPod/i.test(this.userAgent);
};

// Method to get device type
pushSubscriptionSchema.methods.getDeviceType = function() {
  if (!this.userAgent) return "unknown";
  
  const ua = this.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  
  return "unknown";
};

// Static method to get all mobile subscriptions
pushSubscriptionSchema.statics.findMobile = function() {
  return this.find({
    userAgent: /Mobile|Android|iPhone|iPad|iPod/i
  });
};

// Static method to get stale subscriptions (older than specified days)
pushSubscriptionSchema.statics.findStale = function(days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({
    $or: [
      { lastRenewed: { $lt: cutoff } },
      { lastRenewed: null, createdAt: { $lt: cutoff } }
    ]
  });
};

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);