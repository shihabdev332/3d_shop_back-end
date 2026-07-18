const express = require("express");
const router = express.Router();

// Import Controllers
const { signup, signin } = require("../controllers/authController");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById // Fixed: Moved from orderController to productController
} = require("../controllers/productController");
const { getShopMenu } = require("../controllers/shopController");
const {
  getAllOrders,
  updateOrderStatus,
  createOrder,        // Handles new order creation from cart
  getUserOrders,      // Fetches logged-in user's order logs
  getDashboardStats,  // Fetches analytical metrics for dashboard
} = require("../controllers/orderController");

// Import Middlewares
const { protect, admin } = require("../middlewares/authMiddleware");
const { uploadCloud } = require("../config/cloudinary");

// Public Authentication Endpoints
router.post("/auth/signup", signup);
router.post("/auth/signin", signin);

// Public Shop Endpoints
router.get("/shop/menu", getShopMenu);
router.get("/products/:id", getProductById); // Public route to fetch single product details

// Protected User Order Endpoints
router.post("/orders", protect, createOrder);
router.get("/orders/user", protect, getUserOrders);

// Protected Admin Product Endpoints
router.post(
  "/admin/products",
  protect,
  admin,
  uploadCloud.array("images", 4),
  createProduct,
);
router.put(
  "/admin/products/:id",
  protect,
  admin,
  uploadCloud.array("images", 4),
  updateProduct,
);
router.delete("/admin/products/:id", protect, admin, deleteProduct);

// Protected Admin Order & Performance Analytics Endpoints
router.get("/admin/dashboard", protect, admin, getDashboardStats);
router.get("/admin/orders", protect, admin, getAllOrders);
router.put("/admin/orders/:id", protect, admin, updateOrderStatus);

module.exports = router;