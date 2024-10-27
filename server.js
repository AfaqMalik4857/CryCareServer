const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

//dotenv
dotenv.config();

//mongodb connection
connectDB();

// rest object
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/", userRoutes);

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, (error) => {
  if (error) {
    console.log("Server is not running", error);
  }
  console.log("Server is Running on Port", PORT);
});
