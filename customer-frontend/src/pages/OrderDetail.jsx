import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck,
  CreditCard,
  ArrowLeft,
  Store
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { refreshCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      confirmPayment(sessionId);
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled. Your order has not been placed.');
      fetchOrder();
    } else {
      fetchOrder();
    }
  }, [user, authLoading, id, searchParams]);

  const confirmPayment = async (sessionId) => {
    setConfirmingPayment(true);
    try {
      await api.post(`/orders/${id}/payment`, { sessionId });
      toast.success('Payment confirmed! Your order is being processed.');
      refreshCart(); // clear cart badge
      fetchOrder();
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error(error.response?.data?.message || 'Payment confirmation failed');
      fetchOrder();
    } finally {
      setConfirmingPayment(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'processing':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      processing: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please Login</h2>
        <p className="text-gray-600 mb-4">You need to login to view your order</p>
        <Link to="/login" className="btn-primary">
          Login
        </Link>
      </div>
    );
  }

  if (loading || confirmingPayment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        {confirmingPayment && (
          <p className="text-gray-600 font-medium">Confirming your payment...</p>
        )}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to="/orders" className="flex items-center text-primary-600 hover:text-primary-700">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {getStatusIcon(order.orderStatus)}
            <div>
              <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
              <p className="text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`badge ${getStatusBadge(order.orderStatus)} text-base`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
            {order.orderStatus === 'pending' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="btn-outline text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-primary-600">
                    ETB {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address / Pickup */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              {order.deliveryType === 'pickup'
                ? <><Store className="w-5 h-5 mr-2" /> Store Pickup</>
                : <><MapPin className="w-5 h-5 mr-2" /> Delivery Address</>
              }
            </h2>
            {order.deliveryType === 'pickup' ? (
              <p className="text-gray-600">Alpha PC Shop, Addis Ababa, Ethiopia.<br />You'll be notified when your order is ready for pickup.</p>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold">{order.shippingAddress?.street}</p>
                <p className="text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p className="text-gray-600">{order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</p>
                <p className="text-gray-600">Phone: {order.shippingAddress?.phone}</p>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.isPaid && order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid On</span>
                  <span className="font-semibold">{new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">ETB {order.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {order.shippingPrice === 0 ? 'Free (Pickup)' : `ETB ${order.shippingPrice.toLocaleString()}`}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary-600">
                    ETB {order.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Tracking Number</p>
                <p className="text-sm text-blue-600">{order.trackingNumber}</p>
              </div>
            )}

            <Link to="/products" className="block w-full btn-outline text-center mt-6">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
