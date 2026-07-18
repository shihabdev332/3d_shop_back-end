const Order = require('../models/Order');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');

// Create a new order from cart details
exports.createOrder = async (req, res) => {
  try {
    const { shop, items, totalPrice, location, paymentMethod } = req.body;
    
    // Fix: Safely resolve user database identity from authentication middleware
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User unauthorized or token invalid' });
    }

    // Formulate new order instance matching frontend payload structure
    const newOrder = new Order({
      user: userId,
      shop,
      items,
      totalPrice,
      location,
      paymentMethod: paymentMethod || 'Cash on Delivery'
    });

    await newOrder.save();

    // Fix: Safely clear database cart inside a nested block to prevent cascading crashes
    try {
      await Cart.findOneAndDelete({ user: userId });
    } catch (cartError) {
      console.log("Database cart clear skipped:", cartError.message);
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error("CRITICAL BACKEND ERROR IN CREATE_ORDER:", error); // Logs actual error in terminal
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch tracking details for logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("ERROR IN GET_USER_ORDERS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch all orders with user profile details (Admin view)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("ERROR IN GET_ALL_ORDERS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update order status by ID (Admin control)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error("ERROR IN UPDATE_ORDER_STATUS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch analytical metrics and live streams for the admin dashboard grid
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate dynamic global revenue using mongo aggregation pipeline
    const revenueStats = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueStats[0]?.totalRevenue || 0;

    // 2. Fetch record counts from operational models safely
    const totalOrdersCount = await Order.countDocuments();
    const totalProductsCount = await mongoose.model('Product').countDocuments();
    const totalCustomersCount = await mongoose.model('User').countDocuments();

    // 3. Retrieve recent database operational streams for visual monitoring logs
    const recentOrders = await Order.find({})
      .populate('user', 'name')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Default capacity plot matrix for performance vectors chart
    const salesPerformance = [30, 45, 35, 60, 40, 70, 90];

    // Respond with formulated complex dataset mapping
    res.status(200).json({
      success: true,
      stats: {
        revenue: { value: totalRevenue, change: '+14% this week' },
        orders: { value: totalOrdersCount, change: '+8% today' },
        products: { value: totalProductsCount, change: 'Syncing Active' },
        customers: { value: totalCustomersCount, change: '+12 new users' }
      },
      recentOrders,
      salesPerformance
    });
  } catch (error) {
    console.error("ERROR IN GET_DASHBOARD_STATS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};