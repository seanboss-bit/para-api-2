const mongoose = require("mongoose");
const colors = require("colors");

require("dotenv").config();

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DATABASE CONNECTED".blue.bold);
  } catch (error) {
    console.log(error.message.red.bold);

    process.exit(1);
  }
};

module.exports = ConnectDB;