const router = require("express").Router();
const Customer = require("../model/Customer");
const { verifyAdmin } = require("../middleware/verifyToken"); // ✅ import admin middleware

// =====================================
// ✅ CREATE NEW CUSTOMER MESSAGE
// =====================================
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newCustomer = new Customer({
      name,
      email: email.toLowerCase(),
      subject,
      message,
    });

    const savedCustomer = await newCustomer.save();

    res.status(200).json({
      message: "Message sent successfully",
      savedCustomer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// ✅ GET ALL CUSTOMER MESSAGES
// =====================================
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const allCustomer = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All customer messages fetched successfully",
      count: allCustomer.length,
      allCustomer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// ✅ DELETE A CUSTOMER MESSAGE (ADMIN ONLY)
// =====================================
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedMessage = await Customer.findByIdAndDelete(req.params.id);

    if (!deletedMessage)
      return res.status(404).json({ error: "Message not found" });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
