const router = require("express").Router();
const PushSubscription = require("../model/PushSubscription");
const { verifyAdmin } = require("../middleware/verifyToken");
const { webpush, getVapidPublicKey } = require("../lib/push");

// Return VAPID public key for client to use
router.get("/vapidPublicKey", async (req, res) => {
  return res.json({ publicKey: getVapidPublicKey() });
});

// Subscribe - save/update subscription with metadata
router.post("/subscribe", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.user.id; // set by verifyAdmin middleware
    const { subscription, userAgent, expirationTime } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    // Upsert subscription with metadata
    const updated = await PushSubscription.findOneAndUpdate(
      { adminId, endpoint: subscription.endpoint },
      {
        adminId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: userAgent || req.headers["user-agent"],
        expirationTime: expirationTime || null,
        lastRenewed: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Subscription saved/updated for admin ${adminId}:`, {
      id: updated._id,
      endpoint: subscription.endpoint.substring(0, 50) + "...",
      userAgent: userAgent || "unknown",
    });

    return res.status(201).json({
      message: "Subscription saved",
      subscriptionId: updated._id,
    });
  } catch (err) {
    console.error("❌ Subscription save failed:", err);
    return res.status(500).json({ message: "Failed to save subscription" });
  }
});

// Unsubscribe (admins only)
router.post("/unsubscribe", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const endpoint = req.body.endpoint;

    if (!endpoint) {
      return res.status(400).json({ message: "Missing endpoint" });
    }

    const result = await PushSubscription.deleteOne({ adminId, endpoint });

    if (result.deletedCount > 0) {
      console.log(`🗑️ Subscription removed for admin ${adminId}`);
      return res.json({ message: "Unsubscribed successfully" });
    } else {
      return res.status(404).json({ message: "Subscription not found" });
    }
  } catch (err) {
    console.error("❌ Unsubscribe failed:", err);
    return res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

// Test notify (admins only) — sends to all admin subscriptions
router.post("/notify/test", verifyAdmin, async (req, res) => {
  const { title = "Test Notification", body = "This is a test" } = req.body;

  try {
    const subs = await PushSubscription.find({});

    if (subs.length === 0) {
      return res.json({
        message: "No subscriptions found",
        sent: 0,
        failed: 0,
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: "/admin",
      icon: "/images/logo-192-192.png",
      badge: "/images/logo-192-192.png",
      tag: "test-notification",
    });

    console.log(
      `📤 Sending test notification to ${subs.length} subscription(s)`
    );

    const results = await Promise.allSettled(
      subs.map(async (s, index) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: s.endpoint,
              keys: s.keys,
            },
            payload
          );

          // Update last sent timestamp
          await PushSubscription.updateOne(
            { _id: s._id },
            { $set: { lastSent: new Date() } }
          );

          console.log(`✅ Test notification sent to subscription ${index + 1}`);
          return { ok: true, subscriptionId: s._id };
        } catch (err) {
          console.error(`❌ Failed to send to subscription ${index + 1}:`, {
            statusCode: err.statusCode,
            message: err.message,
          });

          // Remove expired subscriptions
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log(`🗑️ Removing expired subscription: ${s._id}`);
            await PushSubscription.deleteOne({ _id: s._id });
          }

          throw err;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - successful;

    console.log(`📊 Test Results: ${successful} sent, ${failed} failed`);

    return res.json({
      message: "Test notifications processed",
      sent: successful,
      failed: failed,
      total: subs.length,
      details: results.map((r) => ({
        status: r.status,
        error: r.status === "rejected" ? r.reason?.message : null,
      })),
    });
  } catch (err) {
    console.error("❌ Test notification error:", err);
    return res
      .status(500)
      .json({ message: "Failed to send test notifications" });
  }
});

// Health check - get all subscriptions status (admins only)
router.get("/subscriptions", verifyAdmin, async (req, res) => {
  try {
    const subs = await PushSubscription.find({}).sort({ createdAt: -1 });

    const subscriptions = subs.map((s) => {
      const age = Date.now() - new Date(s.createdAt).getTime();
      const ageHours = Math.floor(age / (1000 * 60 * 60));
      const ageDays = Math.floor(ageHours / 24);

      return {
        id: s._id,
        adminId: s.adminId,
        endpoint: s.endpoint.substring(0, 60) + "...",
        userAgent: s.userAgent || "unknown",
        createdAt: s.createdAt,
        lastSent: s.lastSent || null,
        lastRenewed: s.lastRenewed || null,
        age: ageDays > 0 ? `${ageDays} days` : `${ageHours} hours`,
      };
    });

    return res.json({
      total: subs.length,
      subscriptions,
    });
  } catch (err) {
    console.error("❌ Failed to fetch subscriptions:", err);
    return res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
});

// Clean up expired subscriptions (optional cron job endpoint)
router.post("/cleanup", verifyAdmin, async (req, res) => {
  try {
    const subs = await PushSubscription.find({});
    let removed = 0;

    for (const s of subs) {
      try {
        // Try sending a silent test
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          JSON.stringify({ title: "health-check", silent: true })
        );
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: s._id });
          removed++;
        }
      }
    }

    console.log(
      `🧹 Cleanup complete: ${removed} expired subscriptions removed`
    );
    return res.json({
      message: "Cleanup complete",
      removed,
      remaining: subs.length - removed,
    });
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    return res.status(500).json({ message: "Cleanup failed" });
  }
});

module.exports = router;
