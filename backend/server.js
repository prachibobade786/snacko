const express = require("express");
require("dotenv").config();

// import local files
const db = require("./src/config/db");
const userRoutes = require("./src/modules/user/userroutes");
const addressRoutes = require("./src/modules/address/addressroutes");
const orderRoutes = require("./src/modules/order/orderroutes");
const orderItemRoutes = require("./src/modules/orderitems/orderitemsrouter");


const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Snacko backend is running",
  });
});

// all routers

app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// checking the connection with database before starting the server

const startServer = async () => {
  try {
    await db.getConnection();
    console.log("Database connection established");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
};

startServer();
