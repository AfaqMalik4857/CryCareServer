const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Database connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.log("Database not connected:", error.message);
  }
};

module.exports = connectDB;
