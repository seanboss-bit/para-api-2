const express = require("express");
const colors = require("colors");
const ConnectDB = require("./DbConnect");
const cors = require("cors");
const product = require("./routes/product");
const order = require("./routes/order");
const email = require("./routes/email");
const customer = require("./routes/customer");
const user = require("./routes/user");
const insta = require("./routes/instagram");
const review = require("./routes/review");
const favourite = require("./routes/favourite");
const cart = require("./routes/cart");
const paystack = require("./routes/paystack");
const pushNotifications = require("./routes/pushSubscription");
const app = express();

const PORT = process.env.PORT || 5000;

ConnectDB();

app.use(express.json());
app.use(cors());
app.use("/product", product);
app.use("/order", order);
app.use("/email", email);
app.use("/customer", customer);
app.use("/user", user);
app.use("/post", insta);
app.use("/review", review);
app.use("/favourite", favourite);
app.use("/cart", cart);
app.use("/payment", paystack);
app.use("/push", pushNotifications);
app.get("/", (req, res) => {
  res.send("Back Running");
});

app.listen(PORT, () => {
  console.log(`BACK UP AND RUNNING ON PORT:${PORT}`.cyan.bold);
});
