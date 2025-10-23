const { verifyToken } = require("../middleware/verifyToken");
const router = require("express").Router();
const axios = require("axios");
const Order = require("../model/Order");
const Cart = require("../model/Cart");

router.post("/initialize", verifyToken, async (req, res) => {
  try {
    const { address, phone, alt_phone, orders, total } = req.body;

    if (!address || !phone || !orders || !total)
      return res.status(400).json({ error: "Missing required order info" });

    const { email, id: userId, firstname: name, lastname: lname } = req.user;
    console.log(req.user);

    // Convert to Kobo
    const koboAmount = total * 100;

    // 1️⃣ Initialize Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: koboAmount,
        callback_url: `${process.env.DOMAIN}/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MAIN_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { reference, authorization_url } = response.data.data;

    // 2️⃣ Create order in DB with "pending" status
    const newOrder = await Order.create({
      userId,
      name,
      lname,
      email,
      address,
      phone,
      alt_phone,
      orders,
      total,
      reference,
      status: "pending",
    });

    // 3️⃣ Return authorization URL to frontend
    res.status(200).json({
      message: "Payment initialized",
      authorization_url,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error(
      "Paystack Init Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

router.get("/verify/:reference", verifyToken, async (req, res) => {
  try {
    const { reference } = req.params;

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TEST_KEY}`,
        },
      }
    );

    const data = verifyRes.data.data;

    if (data.status === "success") {
      await Order.findOneAndUpdate(
        { reference },
        {
          status: "paid",
          paymentInfo: {
            transactionId: data.id,
            channel: data.channel,
            currency: data.currency,
            paidAt: data.paid_at,
          },
        }
      );

      await Cart.findOneAndDelete({ userId: req.user.id });

      return res.status(200).json({ message: "Payment successful", data });
    }

    await Order.findOneAndUpdate({ reference }, { status: "failed" });
    res.status(400).json({ error: "Payment failed" });
  } catch (error) {
    console.error("Verify Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;
