import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, loadingCart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [deliveryFee, setDeliveryFee] = useState(null);

  useEffect(() => {
    api.get('/admin/delivery-fee')
      .then(res => setDeliveryFee(res.data.data.deliveryFee))
      .catch(() => setDeliveryFee(150));
  }, []);

  const getProduct = (item) => item.product;
  const getProductId = (item) => item.product?._id || item.product;

  const calculateTotal = () =>
    cartItems.reduce((sum, item) => {
      const p = getProduct(item);
      const price = p?.discountPrice || p?.price || 0;
      return sum + price * item.quantity;
    }, 0);

  // Delivery fee shown as info only; final choice is made at checkout
  const deliveryFeeDisplay = deliveryFee !== null ? deliveryFee : '...';

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await updateQuantity(productId, quantity);
    } catch {
      toast.error('Failed to update cart');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      // Save intended destination so we can return after login
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (loadingCart) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-4">Add some products to get started</p>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gradient">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = getProduct(item);
            const productId = getProductId(item);
            return (
              <div key={productId} className="card p-4 flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product?.images?.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-gray-200 rounded" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product?.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {product?.specifications?.processor || ''}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(productId, item.quantity + 1)}
                        disabled={item.quantity >= (product?.stock ?? 99)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(productId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-primary-600">
                    ETB {((product?.discountPrice || product?.price || 0) * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    ETB {(product?.discountPrice || product?.price || 0).toLocaleString()} each
                  </p>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleClear}
            className="w-full btn-outline text-red-600 border-red-600 hover:bg-red-50"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">ETB {calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery fee</span>
                <span className="text-gray-500">
                  ETB {deliveryFeeDisplay.toLocaleString?.() ?? deliveryFeeDisplay} (if delivery)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Store pickup</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <p className="text-xs text-gray-400">Choose delivery or pickup at checkout.</p>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">Subtotal</span>
                  <span className="font-bold text-lg text-primary-600">
                    ETB {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-primary text-center"
            >
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>

            <Link
              to="/products"
              className="block w-full btn-outline text-center mt-4"
            >
              Continue Shopping
            </Link>

            {!user && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Your cart is saved. Sign in to complete your order.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
