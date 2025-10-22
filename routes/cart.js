const router = require("express").Router();
const Cart = require("../model/Cart");
const Product = require("../model/Product");
const { verifyToken } = require("../middleware/verifyToken");

// 🧮 Helper function to format cart
const formatCart = async (cart) => {
  if (!cart || !cart.items) {
    return { products: [], quantity: 0, total: 0 };
  }

  // Populate product details
  await cart.populate("items.productId", "name image price category");

  let total = 0;
  let quantity = 0;

  const products = cart.items.map((item) => {
    const product = item.productId;
    const price = product.price * item.quantity;
    total += price;
    quantity += item.quantity;

    return {
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      category: product.category,
      cartQuantity: item.quantity,
      size: item.size || null,
    };
  });

  return { products, quantity, total };
};

// 🛒 Get User Cart
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({
        message: "Cart fetched successfully",
        cart: { products: [], quantity: 0, total: 0 },
      });
    }

    const formattedCart = await formatCart(cart);
    res.status(200).json({
      message: "Cart fetched successfully",
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ➕ Add to Cart
router.post("/add", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity, size }] });
    } else {
      const existingItem = cart.items.find(
        (i) =>
          i.productId.toString() === productId &&
          (size ? i.size === size : true)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, size });
      }
    }

    await cart.save();
    const formattedCart = await formatCart(cart);

    res.status(200).json({
      message: "Item added to cart successfully",
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🗑️ Remove Product from Cart
router.delete("/remove/:productId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    const formattedCart = await formatCart(cart);
    res.status(200).json({
      message: "Item removed from cart",
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔼 Increase Quantity
router.put("/increase/:productId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });

    item.quantity += 1;
    await cart.save();

    const formattedCart = await formatCart(cart);
    res
      .status(200)
      .json({ message: "Quantity increased", cart: formattedCart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔽 Decrease Quantity
router.put("/decrease/:productId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.items = cart.items.filter(
        (i) => i.productId.toString() !== productId
      );
    }

    await cart.save();
    const formattedCart = await formatCart(cart);
    res
      .status(200)
      .json({ message: "Quantity decreased", cart: formattedCart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🧹 Clear Cart
router.delete("/clear", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({
      message: "Cart cleared successfully",
      cart: { products: [], quantity: 0, total: 0 },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
