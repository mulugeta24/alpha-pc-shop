const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Settings = require('../models/Settings');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const paidOrderFilter = { isPaid: true };
    const totalOrders = await Order.countDocuments(paidOrderFilter);
    const processingOrders = await Order.countDocuments({ ...paidOrderFilter, orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ ...paidOrderFilter, orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ ...paidOrderFilter, orderStatus: 'delivered' });

    // Calculate total revenue
    const orders = await Order.find(paidOrderFilter);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Get recent orders (paid only — excludes abandoned pending checkouts)
    const recentOrders = await Order.find(paidOrderFilter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
      .sort({ stock: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          totalRevenue
        },
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
};

// @desc    Get inventory overview
// @route   GET /api/admin/inventory
// @access  Private/Admin
exports.getInventoryOverview = async (req, res) => {
  try {
    const products = await Product.find().sort({ stock: 1 });

    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = products.filter(p => p.stock < 5).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    res.status(200).json({
      success: true,
      data: {
        products,
        summary: {
          totalStock,
          lowStock,
          outOfStock
        }
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory'
    });
  }
};

// @desc    Update stock
// @route   PUT /api/admin/products/:id/stock
// @access  Private/Admin
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.stock = stock;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating stock'
    });
  }
};

// @desc    Get store settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    const deliveryFee = await Settings.get('deliveryFee', 150);
    res.status(200).json({
      success: true,
      data: { deliveryFee }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching settings' });
  }
};

// @desc    Update store settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { deliveryFee } = req.body;

    if (deliveryFee === undefined || isNaN(Number(deliveryFee)) || Number(deliveryFee) < 0) {
      return res.status(400).json({ success: false, message: 'Invalid delivery fee' });
    }

    await Settings.set('deliveryFee', Number(deliveryFee));

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: { deliveryFee: Number(deliveryFee) }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating settings' });
  }
};

// @desc    Get delivery fee (public)
// @route   GET /api/admin/delivery-fee
// @access  Public
exports.getDeliveryFee = async (req, res) => {
  try {
    const deliveryFee = await Settings.get('deliveryFee', 150);
    res.status(200).json({ success: true, data: { deliveryFee } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
