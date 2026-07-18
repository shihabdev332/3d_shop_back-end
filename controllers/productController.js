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
    const { name, price, category, description, is3DModelAvailable } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "Name, price, and category are required" });
    }

    // Extract file paths from req.files populated by multer-storage-cloudinary
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const newProduct = await Product.create({
      name,
      price,
      category,
      description,
      images: imageUrls, // Store the array of Cloudinary URLs
      is3DModelAvailable: is3DModelAvailable || false,
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
    let updatedData = { ...req.body };

    // If new images are uploaded, extract paths and update the images array
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map((file) => file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

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
