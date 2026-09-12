const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Settings = require('../models/Settings');
const { createCheckoutSession, getCheckoutSession } = require('../utils/stripe');
const { sendOrderConfirmationEmail } = require('../utils/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, deliveryType } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const isDelivery = deliveryType === 'delivery';

    // Delivery requires a shipping address
    if (isDelivery && (!shippingAddress || !shippingAddress.street)) {
      return res.status(400).json({ success: false, message: 'Shipping address is required for delivery' });
    }

    // Get products and calculate prices
    let itemsPrice = 0;
    const processedOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const price = product.discountPrice || product.price;
      itemsPrice += price * item.quantity;
      processedOrderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price,
        quantity: item.quantity
      });
    }

    // Get delivery fee from settings (0 for pickup)
    const deliveryFee = await Settings.get('deliveryFee', 150);
    const shippingPrice = isDelivery ? deliveryFee : 0;
    const totalPrice = itemsPrice + shippingPrice;

    // Save order first (status: pending, unpaid)
    const order = await Order.create({
      user: req.user.id,
      orderItems: processedOrderItems,
      shippingAddress: isDelivery ? shippingAddress : {},
      deliveryType: deliveryType || 'delivery',
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      orderStatus: 'pending'
    });

    // Build redirect URLs — frontend sends them in the request or we use env vars
    const clientUrl = process.env.CUSTOMER_FRONTEND_URL || 'http://localhost:3000';
    // Redirect via / so static hosts without SPA rewrites still serve index.html
    const successUrl = `${clientUrl}/?payment=success&orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${clientUrl}/?payment=cancelled`;

    // Create Stripe Checkout Session
    const sessionResult = await createCheckoutSession({
      orderId: order._id,
      orderItems: processedOrderItems,
      shippingPrice,
      totalPrice,
      customerEmail: req.user.email,
      successUrl,
      cancelUrl,
      metadata: { userId: req.user.id },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        sessionUrl: sessionResult.sessionUrl,
        sessionId: sessionResult.sessionId,
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating order' });
  }
};

// @desc    Confirm order payment (called after Stripe redirects back)
// @route   POST /api/orders/:id/payment
// @access  Private
exports.confirmOrderPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    // Verify payment with Stripe
    const sessionResult = await getCheckoutSession(sessionId);

    if (!sessionResult.paid) {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: sessionId,
      status: 'succeeded',
    };
    order.orderStatus = 'processing';

    // Deduct stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    await order.save();

    // Clear the user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

    // Send confirmation email (non-blocking)
    sendOrderConfirmationEmail(req.user.email, order).catch(() => {});

    res.status(200).json({ success: true, message: 'Payment confirmed', data: { order } });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Server error while confirming payment' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Admins cannot view unpaid/pending orders
    if ((req.user.role === 'admin' || req.user.role === 'super_admin') && !order.isPaid) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Get logged in user orders (paid only)
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id, isPaid: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get all orders (admin) — paid orders only
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    // Admins only see paid orders
    const query = { isPaid: true };
    if (status) {
      if (status === 'pending') {
        return res.status(200).json({
          success: true,
          count: 0,
          data: { orders: [] }
        });
      }
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.isPaid) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = orderStatus;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (orderStatus === 'shipped') {
      order.orderStatus = 'shipped';
    } else if (orderStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (orderStatus === 'cancelled') {
      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order'
      });
    }

    order.orderStatus = 'cancelled';

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
};
