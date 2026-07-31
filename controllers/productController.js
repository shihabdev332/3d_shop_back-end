const Product = require("../models/Product");

// Fetch all products for the public shop page
const getShopMenu = async (req, res) => {
  try {
    const products = await Product.find({});

    res.status(200).json({
      message: "Menu fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create and upload a new product with Cloudinary images (Admin Only)

const createProduct = async (req, res) => {
  try {
    const { name, price, category, description, is3DModelAvailable, inStock } = req.body;
    const numericPrice = Number(price);

    // Validate required fields
    if (!name?.trim() || price === undefined || !Number.isFinite(numericPrice) || numericPrice < 0 || !category?.trim()) {
      return res
        .status(400)
        .json({ message: "Name, price, and category are required" });
    }

    // Extract file paths from req.files populated by multer-storage-cloudinary
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const newProduct = await Product.create({
      name: name.trim(),
      price: numericPrice,
      category: category.trim(),
      description,
      images: imageUrls, // Store the array of Cloudinary URLs
      inStock: inStock === undefined || inStock === true || inStock === 'true',
      is3DModelAvailable: is3DModelAvailable === true || is3DModelAvailable === 'true',
    });

    res.status(201).json({
      message: "Product uploaded successfully",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing product and its images by ID (Admin Only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!require('mongoose').isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedData = {};
    const allowedFields = ['name', 'price', 'category', 'description', 'is3DModelAvailable', 'inStock'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updatedData[field] = req.body[field];
    }
    if (updatedData.name !== undefined) updatedData.name = updatedData.name.trim();
    if (updatedData.category !== undefined) updatedData.category = updatedData.category.trim();
    if (updatedData.price !== undefined) {
      updatedData.price = Number(updatedData.price);
      if (!Number.isFinite(updatedData.price) || updatedData.price < 0) {
        return res.status(400).json({ message: 'Price must be a non-negative number.' });
      }
    }
    if (updatedData.is3DModelAvailable !== undefined) {
      updatedData.is3DModelAvailable = updatedData.is3DModelAvailable === true || updatedData.is3DModelAvailable === 'true';
    }
    if (updatedData.inStock !== undefined) {
      updatedData.inStock = updatedData.inStock === true || updatedData.inStock === 'true';
    }

    let removedImages = [];
    if (req.body.removedImages) {
      try {
        removedImages = JSON.parse(req.body.removedImages);
      } catch {
        return res.status(400).json({ message: 'Invalid removed image list.' });
      }
      if (!Array.isArray(removedImages) || removedImages.some((image) => typeof image !== 'string')) {
        return res.status(400).json({ message: 'Invalid removed image list.' });
      }
    }

    const retainedImages = existingProduct.images.filter((image) => !removedImages.includes(image));
    const uploadedImages = req.files ? req.files.map((file) => file.path) : [];
    if (retainedImages.length + uploadedImages.length > 4) {
      return res.status(400).json({ message: 'A product can have at most four images.' });
    }
    if (removedImages.length > 0 || uploadedImages.length > 0) {
      updatedData.images = [...retainedImages, ...uploadedImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getProductById = async (req, res) => {
  try {
    if (!require('mongoose').isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a product by ID (Admin Only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!require('mongoose').isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getShopMenu,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
};
