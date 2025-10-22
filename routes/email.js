const router = require("express").Router();
const Email = require("../model/Email");
const { verifyAdmin } = require("../middleware/verifyToken"); // optional, if you want to restrict delete access

// =====================================
// ✅ SUBSCRIBE (Prevent Duplicate Email)
// =====================================
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // Check if email already exists
    const existing = await Email.findOne({ email: email.toLowerCase() });
    if (existing)
      return res
        .status(400)
        .json({ error: "This email is already subscribed" });

    const newEmail = new Email({ email: email.toLowerCase() });
    const savedEmail = await newEmail.save();

    res.status(200).json({
      message: "Subscribed successfully",
      savedEmail,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// ✅ GET ALL SUBSCRIBED EMAILS
// =====================================
router.get("/", async (req, res) => {
  try {
    const allEmail = await Email.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All emails fetched successfully",
      count: allEmail.length,
      allEmail,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// ✅ DELETE EMAIL (Admin Only)
// =====================================
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedEmail = await Email.findByIdAndDelete(req.params.id);

    if (!deletedEmail)
      return res.status(404).json({ error: "Email not found" });

    res.status(200).json({ message: "Email deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
