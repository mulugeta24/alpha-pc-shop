const Product = require('../models/Product');
const { uploadMultipleImages, deleteImage } = require('../utils/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, isFeatured, isNewArrival, sort } = req.query;

    let query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Featured filter
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // New arrival filter
    if (isNewArrival === 'true') {
      query.isNewArrival = true;
    }

    // Sorting
    let sortOption = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortOption[field.substring(1)] = -1;
        } else {
          sortOption[field] = 1;
        }
      });
    } else {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    let { name, description, category, price, discountPrice, specifications, stock, isFeatured, isNewArrival } = req.body;

    // specifications may arrive as a JSON string from multipart/form-data
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch (e) { specifications = {}; }
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadResults = await uploadMultipleImages(req.files.map(f => f.path));
      images = uploadResults.map((result, index) => ({
        public_id: result.public_id,
        url: result.url,
        alt: `${name} - Image ${index + 1}`
      }));
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      discountPrice: discountPrice || null,
      currency: 'ETB',
      images,
      specifications,
      stock,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isNewArrival: isNewArrival === 'true' || isNewArrival === true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let { name, description, category, price, discountPrice, specifications, stock, isFeatured, isNewArrival } = req.body;

    // specifications may arrive as a JSON string from multipart/form-data
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch (e) { specifications = product.specifications; }
    }

    // Handle image uploads — only replace if new files were sent
    let images = product.images;
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const image of product.images) {
        if (image.public_id) await deleteImage(image.public_id);
      }
      const uploadResults = await uploadMultipleImages(req.files.map(f => f.path));
      images = uploadResults.map((result, index) => ({
        public_id: result.public_id,
        url: result.url,
        alt: `${name || product.name} - Image ${index + 1}`
      }));
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        price,
        discountPrice: discountPrice || null,
        images,
        specifications,
        stock,
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isNewArrival: isNewArrival === 'true' || isNewArrival === true
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      await deleteImage(image.public_id);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products'
    });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(8);

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching new arrivals'
    });
  }
};
