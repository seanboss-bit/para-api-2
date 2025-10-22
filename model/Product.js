const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true }, // helpful for display
    rating: { type: Number, required: true, min: 1, max: 5 }, // ⭐ rating
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    slashPrice: {
      type: Number,
      default: "",
    },
    description: {
      type: String,
    },
    review: {
      type: Array,
      default: [ReviewSchema],
    },
    sizes: {
      type: Array,
      required: true,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    extraImg: {
      type: Array,
      default: [],
    },
    inStock: {
      type: Boolean,
      required: true,
    },
    stockX: {
      type: String,
    },
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
