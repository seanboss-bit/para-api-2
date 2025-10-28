const router = require("express").Router();
const PushSubscription = require("../model/PushSubscription");
const { verifyAdmin } = require("../middleware/verifyToken");
const { webpush, getVapidPublicKey } = require("../lib/push");

// return VAPID public key for client to use
router.get("/vapidPublicKey", async (req, res) => {
  return res.json({ publicKey: getVapidPublicKey() });
});

router.post("/subscribe", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.user.id; // set by verifyAdminMiddleware
    const subscription = req.body.subscription;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    await PushSubscription.findOneAndUpdate(
      { adminId, endpoint: subscription.endpoint },
      {
        adminId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ message: "Subscription saved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save subscription" });
  }
});

// Unsubscribe (admins only)
router.post("/unsubscribe", verifyAdmin, async (req, res) => {
  try {
    const adminId = req.user._id;
    const endpoint = req.body.endpoint;
    if (!endpoint) return res.status(400).json({ message: "Missing endpoint" });

    await PushSubscription.deleteOne({ adminId, endpoint });
    return res.json({ message: "Unsubscribed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

// Test notify (admins only) — sends to all admin subscriptions
router.post("/notify/test", verifyAdmin, async (req, res) => {
  const { title = "Test", body = "This is a test" } = req.body;
  try {
    const subs = await PushSubscription.find({});
    const payload = JSON.stringify({ title, body, url: "/" });

    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush
          .sendNotification(
            {
              endpoint: s.endpoint,
              keys: s.keys,
            },
            payload
          )
          .catch((err) => {
            throw { err, sub: s };
          })
      )
    );

    return res.json({ results: results.map((r) => r.status) });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to send test notifications" });
  }
});

module.exports = router;
