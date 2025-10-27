const PushSubscription = require("../model/PushSubscription");
const { webpush } = require("./push");

async function sendOrderNotification(order) {
  const payload = JSON.stringify({
    title: "🛍️ New Order Received!",
    body: `Order #${order._id} — ${order.name} ${
      order.lname
    } • ₦${order.total.toLocaleString()}`,
    url: `/admin/orders`,
    icon: "/icons/logo-192-192.png", // path to your PWA icon (served from public/)
    tag: `order-${order._id}`,
  });

  const subs = await PushSubscription.find({});
  const sendResults = await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          payload
        );
        return { ok: true };
      } catch (err) {
        // if 404/410 expired, remove subscription
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await PushSubscription.deleteOne({ _id: s._id });
          } catch (e) {
            console.error(e);
          }
        }
        console.error("Push send error", err);
        return { ok: false, error: err };
      }
    })
  );

  return sendResults;
}

module.exports = sendOrderNotification;
