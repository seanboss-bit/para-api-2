const router = require("express").Router();
const Product = require("../model/Product");
const Favourite = require("../model/Favourite"); // <-- add this model (as designed earlier)
const { verifyToken } = require("../middleware/verifyToken"); // assuming you already have this middleware
const {
  verifyTokenOptional,
  verifyAdmin,
} = require("../middleware/verifyToken");

// 🆕 CREATE PRODUCT
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const newShoe = new Product(req.body);
    const savedShoe = await newShoe.save();

    res.status(201).json({
      message: "New Kicks Added",
      product: savedShoe,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🧭 GET ALL PRODUCTS (supports infinite scroll + search + sorting + filtering + favourites)
router.get("/", verifyTokenOptional, async (req, res) => {
  try {
    const skip = req.query.skip ? Number(req.query.skip) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 15;
    const search = req.query.search || "";
    const sort = req.query.sort || "new"; // "new" | "low" | "high"
    const category = req.query.category || ""; // e.g. "nike" or "jordan"

    const query = {};

    // 🔍 Search by name or category
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Filter by category (e.g., Nike, Jordan)
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    // 💰 Sorting logic
    let sortOption = { createdAt: -1 };
    if (sort === "low") sortOption = { price: 1 };
    if (sort === "high") sortOption = { price: -1 };

    const allKicks = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // ⭐ Add favourites if user is logged in
    if (req.user) {
      const favourites = await Favourite.find({ userId: req.user.id }).select(
        "productId"
      );
      const favouriteIds = new Set(
        favourites.map((f) => f.productId.toString())
      );

      const allKicksWithFav = allKicks.map((p) => ({
        ...p.toObject(),
        isFavourite: favouriteIds.has(p._id.toString()),
      }));

      return res.status(200).json({
        message: "All Kicks (Authenticated)",
        count: allKicksWithFav.length,
        products: allKicksWithFav,
      });
    }

    // 🚀 Public response
    res.status(200).json({
      message: "All Kicks",
      count: allKicks.length,
      products: allKicks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔎 ADMIN — GET ALL PRODUCTS
router.get("/admin/kicks", verifyAdmin, async (req, res) => {
  try {
    const allKicks = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "All Kicks (Admin)",
      count: allKicks.length,
      products: allKicks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🧩 UPDATE PRODUCT
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const existingShoe = await Product.findById(req.params.id);
    if (!existingShoe) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Only update fields that are actually provided in req.body
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );

    const updatedShoe = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      message: "Updated Kicks Successfully",
      product: updatedShoe,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 👟 GET SINGLE PRODUCT
router.get("/find/:id", verifyTokenOptional, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ✅ If token is present and user is authenticated
    if (req.user) {
      const fav = await Favourite.findOne({
        userId: req.user.id,
        productId: req.params.id,
      });

      const productWithFav = {
        ...product.toObject(),
        isFavourite: !!fav, // true if favourite exists, false otherwise
      };

      return res.status(200).json({
        message: "Kicks Found Successfully (Authenticated)",
        product: productWithFav,
      });
    }

    // 🚀 Public response
    res.status(200).json({
      message: "Kicks Found Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ DELETE PRODUCT
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/minimal", async (req, res) => {
  try {
    // Select only _id, name, and image fields from Product
    const products = await Product.find({}, "_id name image");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products.map((p) => ({
        id: p._id,
        name: p.name,
        mainImg: p.image,
      })),
    });
  } catch (err) {
    console.error("Error fetching minimal products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/random", async (req, res) => {
  try {
    // Use MongoDB aggregation pipeline to get 6 random documents
    const randomProducts = await Product.aggregate([{ $sample: { size: 6 } }]);

    res.status(200).json({
      message: "Random 6 Products",
      count: randomProducts.length,
      products: randomProducts,
    });
  } catch (error) {
    console.error("Error fetching random products:", error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
