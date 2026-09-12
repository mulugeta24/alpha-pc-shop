const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.find({
      isPaid: true,
      createdAt: { $gte: startDate }
    });

    // Group by date
    const salesByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { orders: 0, revenue: 0 };
      }
      salesByDate[date].orders += 1;
      salesByDate[date].revenue += order.totalPrice;
    });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.status(200).json({
      success: true,
      data: {
        salesByDate,
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue
        }
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales analytics'
    });
  }
};

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private/Admin
exports.getProductAnalytics = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });

    // Get top selling products
    const orders = await Order.find({ isPaid: true });
    const productSales = {};

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          productSales[productId] = { quantity: 0, revenue: 0 };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.price * item.quantity;
      });
    });

    const topSellingProducts = Object.entries(productSales)
      .map(([productId, sales]) => {
        const product = products.find(p => p._id.toString() === productId);
        return {
          productId,
          productName: product ? product.name : 'Unknown Product',
          ...sales
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        products,
        topSellingProducts
      }
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product analytics'
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
exports.getUserAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await User.find({
      createdAt: { $gte: startDate }
    });

    // Group by date
    const usersByDate = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!usersByDate[date]) {
        usersByDate[date] = 0;
      }
      usersByDate[date] += 1;
    });

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    res.status(200).json({
      success: true,
      data: {
        usersByDate,
        summary: {
          totalUsers,
          verifiedUsers,
          newUsers: users.length
        }
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user analytics'
    });
  }
};

// @desc    Get order analytics
// @route   GET /api/analytics/orders
// @access  Private/Admin
exports.getOrderAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.find({
      isPaid: true,
      orderStatus: { $ne: 'pending' },
      createdAt: { $gte: startDate }
    });

    // Group by status
    const ordersByStatus = {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      ordersByStatus[order.orderStatus] += 1;
    });

    // Group by date
    const ordersByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!ordersByDate[date]) {
        ordersByDate[date] = 0;
      }
      ordersByDate[date] += 1;
    });

    res.status(200).json({
      success: true,
      data: {
        ordersByStatus,
        ordersByDate,
        totalOrders: orders.length
      }
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order analytics'
    });
  }
};
