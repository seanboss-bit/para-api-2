const mongoose = require("mongoose");

const InstagramSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Instagram = mongoose.model("Instagram", InstagramSchema);
module.exports = Instagram;
