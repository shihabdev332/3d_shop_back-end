const Product = require('../models/Product');

// Fetch all products for the brand's menu/shop page
exports.getShopMenu = async (req, res) => {
  try {
    const products = await Product.find({});
    
    // Normalize data to support both old (image) and new (images) fields
    const normalizedProducts = products.map(product => {
      const p = product.toObject();
      
      // If images array is empty or missing, fallback to single image string
      if (!p.images || p.images.length === 0) {
        p.images = p.image ? [p.image] : [];
      }
      
      return p;
    });

    res.status(200).json({
      message: 'Menu fetched successfully',
      count: normalizedProducts.length,
      products: normalizedProducts // Sending normalized data to frontend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};