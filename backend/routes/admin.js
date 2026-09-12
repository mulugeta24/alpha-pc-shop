const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getInventoryOverview,
  updateStock,
  getSettings,
  updateSettings,
  getDeliveryFee
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin', 'super_admin'), getDashboardStats);
router.get('/inventory', protect, authorize('admin', 'super_admin'), getInventoryOverview);
router.put('/products/:id/stock', protect, authorize('admin', 'super_admin'), updateStock);
router.get('/settings', protect, authorize('admin', 'super_admin'), getSettings);
router.put('/settings', protect, authorize('admin', 'super_admin'), updateSettings);
router.get('/delivery-fee', getDeliveryFee); // public — used by checkout

module.exports = router;
