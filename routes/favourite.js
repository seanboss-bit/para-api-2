const router = require("express").Router();
const Favourite = require("../model/Favourite");
const User = require("../model/User");
const Product = require("../model/Product");
const { verifyToken } = require("../middleware/verifyToken"); // if you already have middleware

// ✅ ADD OR REMOVE PRODUCT FROM FAVOURITES (toggle)
router.post("/:productId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const existing = await Favourite.findOne({ userId, productId });
    if (existing) {
      // remove favourite
      await Favourite.findByIdAndDelete(existing._id);
      await User.findByIdAndUpdate(userId, {
        $pull: { favourites: productId },
      });
      return res.status(200).json({ message: "Removed from favourites" });
    }

    // add favourite
    const fav = new Favourite({ userId, productId });
    await fav.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { favourites: productId },
    });

    res.status(200).json({ message: "Added to favourites" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET ALL FAVOURITES FOR USER
router.get("/my", verifyToken, async (req, res) => {
  try {
    const favourites = await Favourite.find({ userId: req.user.id })
      .populate("productId")
      .sort({ createdAt: -1 });

    // Map each populated product and add the `isFavourite` flag
    const formattedFavourites = favourites.map((fav) => {
      const product = fav.productId.toObject(); // Convert mongoose doc to plain object
      return {
        ...product,
        isFavourite: true,
      };
    });

    res.status(200).json({
      message: "Favourites fetched successfully",
      favourites: formattedFavourites,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ CHECK IF A SPECIFIC PRODUCT IS FAVOURITED
router.get("/check/:productId", verifyToken, async (req, res) => {
  try {
    const existing = await Favourite.findOne({
      userId: req.user.id,
      productId: req.params.productId,
    });
    res.status(200).json({ isFavourite: !!existing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
