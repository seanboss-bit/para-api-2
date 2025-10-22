const mongoose = require("mongoose");

const FavouriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicates — one user can’t favourite the same product twice
FavouriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favourite = mongoose.model("Favourite", FavouriteSchema);
module.exports = Favourite;
