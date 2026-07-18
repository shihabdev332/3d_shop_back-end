const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getAdminOrders, 
  updateOrderStatus 
} = require('../controllers/orderController');

// আপনার তৈরি করা Auth Middleware (প্রয়োজন অনুযায়ী ইম্পোর্ট করে নেবেন)
const { protect, admin } = require('../middleware/authMiddleware');

// ১. কাস্টমার রাউটস
router.post('/', protect, createOrder);       // কার্ট থেকে অর্ডার প্লেস করা
router.get('/user', protect, getUserOrders);  // কাস্টমারের নিজের অর্ডার দেখা

// ২. অ্যাডমিন রাউটস
router.get('/admin', protect, admin, getAdminOrders);          // সব অর্ডার দেখা
router.put('/admin/:id/status', protect, admin, updateOrderStatus); // স্ট্যাটাস আপডেট করা

module.exports = router;