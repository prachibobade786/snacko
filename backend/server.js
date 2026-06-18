const express = require("express");
require("dotenv").config();

// import local files
const db = require("./src/config/db");

// Sanika routes
const userRoutes = require("./src/modules/user/userroutes");
const addressRoutes = require("./src/modules/address/addressroutes");
const orderRoutes = require("./src/modules/order/orderroutes");
const orderItemRoutes = require("./src/modules/orderitems/orderitemsrouter");


// Prachi routes
const categoryRoutes = require("./src/modules/category/categoryRoutes");
const productRoutes = require("./src/modules/product/productRoutes");
const cartItemRoutes = require("./src/modules/cartItem/cartItemRoutes");
const paymentRoutes = require("./src/modules/payment/paymentRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Snacko backend is running"
  });
});

// Sanika APIs
app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);

// Prachi APIs
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", cartItemRoutes);
app.use("/api", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
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
