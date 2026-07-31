// Main entry point for the Express server
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const requiredEnvironment = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (missingEnvironment.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
}

// Initialize express app
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware setup
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include tools such as curl and health checks.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
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
module.exports = app;
