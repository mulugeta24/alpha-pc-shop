const express = require('express');
const router = express.Router();
const {
  getSalesAnalytics,
  getProductAnalytics,
  getUserAnalytics,
  getOrderAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/sales', protect, authorize('admin', 'super_admin'), getSalesAnalytics);
router.get('/products', protect, authorize('admin', 'super_admin'), getProductAnalytics);
router.get('/users', protect, authorize('admin', 'super_admin'), getUserAnalytics);
router.get('/orders', protect, authorize('admin', 'super_admin'), getOrderAnalytics);

module.exports = router;
