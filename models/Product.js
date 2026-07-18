const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  // Updated to store multiple Cloudinary image URLs as an array
  images: { 
    type: [String],
    default: []
  },
  is3DModelAvailable: { 
    type: Boolean, 
    default: false // Flag for React Three Fiber rendering
  }
});

module.exports = mongoose.model('Product', productSchema);