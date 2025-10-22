const router = require("express").Router();
const Review = require("../model/Review");
const Product = require("../model/Product");
const User = require("../model/User");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");

// ✅ ADD PRODUCT REVIEW
router.post("/product/:productId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview)
      return res
        .status(400)
        .json({ error: "You already reviewed this product" });

    const review = new Review({
      type: "product",
      userId,
      username: user.username,
      productId,
      rating,
      comment,
    });

    await review.save();

    // add to product & user model for quick access
    await Product.findByIdAndUpdate(productId, {
      $push: {
        review: {
          userId,
          username: user.username,
          rating,
          comment,
          createdAt: new Date(),
        },
      },
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        reviews: { productId, rating, comment, createdAt: new Date() },
      },
    });

    res.status(200).json({ message: "Review added successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET ALL REVIEWS FOR A PRODUCT
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      type: "product",
    })
      .populate("userId", "username image")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Reviews fetched successfully", reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ ADD WEBSITE REVIEW (for homepage)
router.post("/website", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const review = new Review({
      type: "website",
      userId: user._id,
      username: user.username,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    await review.save();
    res.status(200).json({ message: "Website review added", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET ALL WEBSITE REVIEWS
router.get("/website", async (req, res) => {
  try {
    const reviews = await Review.find({ type: "website" })
      .populate("userId", "username image")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Website reviews fetched", reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE REVIEW
router.delete("/:reviewId", verifyAdmin, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const deleted = await Review.findByIdAndDelete(reviewId);
    if (!deleted) return res.status(404).json({ error: "Review not found" });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL REVIEW
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const { type } = req.query; // e.g. /api/review?type=website

    let filter = {};
    if (type) filter.type = type; // optional filter by type

    const reviews = await Review.find(filter)
      .populate("userId", "username image")
      .populate("productId", "name mainImg")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reviews fetched successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
