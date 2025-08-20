const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const router = require("./routes");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // allow frontend origin explicitly
    credentials: true, // allow cookies/credentials
  })
);

app.use(cookieParser());

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", router);

const PORT = 8000 || process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Connect to DB");
    console.log("Server is running");
  });
});
