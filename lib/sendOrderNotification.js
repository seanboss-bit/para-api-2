const PushSubscription = require("../model/PushSubscription");
const { webpush } = require("./push");

async function sendOrderNotification(order) {
  const payload = JSON.stringify({
    title: "🛍️ New Order Received!",
    body: `Order #${order._id.toString().slice(-6)} — ${order.name} ${
      order.lname
    } • ₦${order.total.toLocaleString()}`,
    url: `/admin/orders`,
    icon: "/images/logo-192-192.png",
    badge: "/images/logo-192-192.png",
    tag: `order-${order._id}`,
    vibrate: [200, 100, 200],
    requireInteraction: true, // Keep notification visible on mobile
    timestamp: Date.now(),
    data: {
      orderId: order._id.toString(),
      type: "new_order",
    },
  });

  const subs = await PushSubscription.find({});

  if (subs.length === 0) {
    console.log("⚠️ No push subscriptions found - notification not sent");
    return [];
  }

  console.log(
    `📤 Sending order notification to ${subs.length} subscription(s)`
  );

  const sendResults = await Promise.allSettled(
    subs.map(async (s, index) => {
      try {
        const subscription = {
          endpoint: s.endpoint,
          keys: {
            p256dh: s.keys.p256dh,
            auth: s.keys.auth,
          },
        };

        await webpush.sendNotification(subscription, payload);

        // Update last sent timestamp
        await PushSubscription.updateOne(
          { _id: s._id },
          { $set: { lastSent: new Date() } }
        );

        console.log(
          `✅ Order notification sent to subscription ${
            index + 1
          } (${s.getDeviceType()})`
        );

        return {
          ok: true,
          subscriptionId: s._id,
          deviceType: s.getDeviceType(),
        };
      } catch (err) {
        console.error(
          `❌ Order notification failed for subscription ${index + 1}:`,
          {
            statusCode: err.statusCode,
            endpoint: s.endpoint.substring(0, 50) + "...",
            deviceType: s.getDeviceType(),
            message: err.message,
          }
        );

        // Handle expired/invalid subscriptions (410 Gone or 404 Not Found)
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(
            `🗑️ Removing expired subscription: ${s._id} (${s.getDeviceType()})`
          );
          try {
            await PushSubscription.deleteOne({ _id: s._id });
          } catch (deleteErr) {
            console.error("Failed to delete expired subscription:", deleteErr);
          }
        }

        return {
          ok: false,
          error: err.message,
          statusCode: err.statusCode,
          deviceType: s.getDeviceType(),
        };
      }
    })
  );

  const successful = sendResults.filter(
    (r) => r.status === "fulfilled" && r.value.ok
  ).length;
  const failed = sendResults.length - successful;

  console.log(
    `📊 Order Notification Results: ${successful} sent, ${failed} failed`
  );

  // Log device breakdown
  const deviceBreakdown = sendResults
    .filter((r) => r.status === "fulfilled")
    .reduce((acc, r) => {
      const device = r.value.deviceType || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

  console.log(`📱 Device breakdown:`, deviceBreakdown);

  return sendResults;
}

module.exports = sendOrderNotification;
