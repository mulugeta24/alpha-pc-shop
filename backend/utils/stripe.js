const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session (hosted payment page).
 * Stripe redirects the user to their secure page, collects card details,
 * then redirects back to success/cancel URLs.
 *
 * NOTE: Stripe does not support ETB. We charge in USD and display ETB prices
 * as product names so customers see the correct amounts.
 */
const createCheckoutSession = async ({ orderId, orderItems, shippingPrice, totalPrice, customerEmail, successUrl, cancelUrl, metadata = {} }) => {
  try {
    // Build line items — Stripe requires amounts in the smallest currency unit (cents for USD)
    // We present ETB amounts in the item name for clarity.
    const lineItems = orderItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.name} (ETB ${(item.price * item.quantity).toLocaleString()})`,
          images: item.image ? [item.image] : [],
        },
        // Convert ETB → USD at a fixed rate for Stripe processing (1 USD ≈ 57 ETB)
        // Stripe amount is in cents
        unit_amount: Math.round((item.price / 57) * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery fee as a separate line item if applicable
    if (shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `Delivery Fee (ETB ${shippingPrice.toLocaleString()})` },
          unit_amount: Math.round((shippingPrice / 57) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: orderId.toString(),
        ...metadata,
      },
    });

    return { success: true, sessionId: session.id, sessionUrl: session.url };
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    throw new Error(error.message || 'Payment processing failed');
  }
};

/**
 * Retrieve a Checkout Session to verify payment status.
 */
const getCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      success: true,
      paid: session.payment_status === 'paid',
      session,
    };
  } catch (error) {
    console.error('Stripe session retrieval error:', error);
    throw new Error('Failed to verify payment');
  }
};

// Keep for backward compatibility
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((amount / 57) * 100),
      currency: 'usd',
      metadata,
    });
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    throw new Error('Payment processing failed');
  }
};

const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      paymentIntent,
    };
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    throw new Error('Payment confirmation failed');
  }
};

module.exports = {
  createCheckoutSession,
  getCheckoutSession,
  createPaymentIntent,
  confirmPayment,
};
