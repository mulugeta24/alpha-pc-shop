import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CreditCard, MapPin, Truck, Store, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ethiopia',
    phone: ''
  });

  useEffect(() => {
    if (searchParams.get('payment') === 'cancelled') {
      toast.error('Payment was cancelled. Your order has not been placed.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    fetchCart();
    loadUserAddress();
    fetchDeliveryFee();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryFee = async () => {
    try {
      const res = await api.get('/admin/delivery-fee');
      setDeliveryFee(res.data.data.deliveryFee);
    } catch {
      setDeliveryFee(150);
    }
  };

  const loadUserAddress = () => {
    if (user?.addresses?.length > 0) {
      const addr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setFormData({
        street: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        zipCode: addr.zipCode || '',
        country: addr.country || 'Ethiopia',
        phone: user.phone || ''
      });
    } else if (user?.phone) {
      setFormData(prev => ({ ...prev, phone: user.phone }));
    }
  };

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const shippingCost = () => (deliveryType === 'delivery' ? deliveryFee : 0);
  const calculateTotal = () => calculateSubtotal() + shippingCost();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate address for delivery
    if (deliveryType === 'delivery') {
      const { street, city, state, zipCode, country, phone } = formData;
      if (!street || !city || !state || !zipCode || !country || !phone) {
        toast.error('Please fill in all delivery address fields');
        return;
      }
    }

    setProcessing(true);
    try {
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      const payload = {
        orderItems,
        paymentMethod: 'stripe',
        deliveryType,
        shippingAddress: deliveryType === 'delivery' ? formData : undefined
      };

      const response = await api.post('/orders', payload);
      const { sessionUrl } = response.data.data;

      // Redirect to Stripe's hosted checkout page
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gradient">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-6">

            {/* Delivery / Pickup */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">How would you like to receive your order?</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                    deliveryType === 'delivery'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Truck className={`w-8 h-8 ${deliveryType === 'delivery' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">Home Delivery</span>
                  <span className="text-sm">ETB {deliveryFee.toLocaleString()} fee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                    deliveryType === 'pickup'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Store className={`w-8 h-8 ${deliveryType === 'pickup' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">Store Pickup</span>
                  <span className="text-sm text-green-600 font-medium">Free</span>
                </button>
              </div>

              {deliveryType === 'pickup' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <strong>Pickup address:</strong> Alpha PC Shop, Addis Ababa, Ethiopia<br />
                  You'll be notified by email when your order is ready.
                </div>
              )}
            </div>

            {/* Delivery address */}
            {deliveryType === 'delivery' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input type="text" name="street" required className="input-field"
                      value={formData.street} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input type="text" name="city" required className="input-field"
                        value={formData.city} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State / Region</label>
                      <input type="text" name="state" required className="input-field"
                        value={formData.state} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                      <input type="text" name="zipCode" required className="input-field"
                        value={formData.zipCode} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input type="text" name="country" required className="input-field"
                        value={formData.country} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="phone" required className="input-field"
                      value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {/* Payment info */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </h2>
              <div className="p-4 border rounded-lg bg-gray-50 flex items-start gap-3 mb-4">
                <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-sm">
                  You'll be redirected to <strong>Stripe's secure payment page</strong> to enter your card details. Your payment info never touches our servers.
                </p>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ETB {calculateTotal().toLocaleString()} securely
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right column — order summary */}
          <div className="card p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cart.items.map((item) => (
                <div key={item.product._id} className="flex items-center space-x-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images?.length > 0 ? (
                      <img src={item.product.images[0].url} alt={item.product.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-200 rounded" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">
                    ETB {((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">ETB {calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{deliveryType === 'delivery' ? 'Delivery Fee' : 'Pickup'}</span>
                <span className={`font-semibold ${deliveryType === 'pickup' ? 'text-green-600' : ''}`}>
                  {deliveryType === 'pickup' ? 'Free' : `ETB ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary-600">
                    ETB {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Confirmation will be sent to:</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
