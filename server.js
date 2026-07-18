// Main entry point for the Express server
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware setup
app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies

// Import and use API routes
app.use('/api/v1', require('./routes/api'));

// Base test route
app.get('/', (req, res) => {
  res.send('Coffee Shop Backend API is running...');
});

// Define Server Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});