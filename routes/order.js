const router = require("express").Router();
const Order = require("../model/Order");

// NEW PRODUCT
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order({
      userId: req.body.userId,
      name: req.body.name,
      orders: req.body.orders,
      email: req.body.email,
      address: req.body.address,
      phone: req.body.phone,
      total: req.body.total,
      alt_phone: req.body.alt_phone,
      lname: req.body.lname,
      reference: req.body.reference,
    });
    const savedOrder = await newOrder.save();

    res.status(200).json({
      message: "Order Placed Successfully",
      savedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const allOrders = await Order.find().sort({ _id: -1 });

    res.status(200).json({
      message: "All Orders",
      allOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE A PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({
      message: "Updated Order Sucessfully",
      updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET A SINGLE PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Order.findById(req.params.id);
    res.status(200).json({
      message: "Order Found Sucessfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Order Has Been Deleted Sucessfully!!!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET USER ORDERS
router.get("/user/find/:id", async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.id }).sort({ _id: -1 });
    res.status(200).json({
      message: "This User Orders Found Sucessfully",
      order,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
