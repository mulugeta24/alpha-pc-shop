const express = require('express');
const router = express.Router();
const {
  createOrder,
  confirmOrderPayment,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
// my-orders MUST come before /:id so it isn't swallowed by the param route
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, authorize('admin', 'super_admin'), getAllOrders);
router.post('/:id/payment', protect, confirmOrderPayment);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('admin', 'super_admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
