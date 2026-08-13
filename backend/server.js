const express = require("express");
require("dotenv").config();

// import local files
const db = require("./src/config/db");
const initDb = require("./src/config/initDb");

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
const warehouseRoutes = require("./src/modules/warehouse/warehouseRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all cross-origin requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require("path");
const publicPath = path.join(__dirname, "..", "frontend", "public");
if (require("fs").existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

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
app.use("/api", warehouseRoutes);

// Admin Portal APIs
const adminRoutes = require("./src/modules/admin/adminRoutes");
app.use("/api/admin", adminRoutes);

// Review APIs
const reviewRoutes = require("./src/modules/review/reviewRoutes");
app.use("/api", reviewRoutes);

// Coupon APIs
const couponRoutes = require("./src/modules/coupon/couponroutes");
app.use("/api/coupons", couponRoutes);

// AI Assistant APIs
const aiRoutes = require("./src/modules/ai/aiRoutes");
app.use("/api/ai", aiRoutes);

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
    // 1. Initialize database (create db/tables/seed if not exists)
    await initDb();

    // 2. Connect pool
    await db.getConnection();
    console.log("Database connection established");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT} (0.0.0.0)`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }
};

startServer();
