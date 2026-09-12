import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  CheckCircle,
  Truck,
  XCircle,
  Save,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data.order);
      setTrackingNumber(response.data.data.order.trackingNumber || '');
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${id}/status`, {
        orderStatus: status,
        trackingNumber: trackingNumber || undefined
      });
      toast.success('Order status updated successfully');
      fetchOrder();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      processing: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
    <div className="space-y-6">
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
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`badge ${getStatusBadge(order.orderStatus)} text-base`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">ETB {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p className="font-semibold">{order.user?.name || 'Unknown'}</p>
              <p className="text-gray-600">{order.user?.email}</p>
            </div>
          </div>

          {/* Shipping Address / Pickup */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              {order.deliveryType === 'pickup'
                ? <><Package className="w-5 h-5 mr-2" /> Fulfillment Method</>
                : <><MapPin className="w-5 h-5 mr-2" /> Shipping Address</>
              }
            </h2>
            {order.deliveryType === 'pickup' ? (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-800">🏪 Store Pickup</p>
                <p className="text-sm text-blue-600 mt-1">
                  Customer will collect from: Alpha PC Shop, Addis Ababa, Ethiopia.
                </p>
              </div>
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

        {/* Order Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">ETB {order.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{order.deliveryType === 'pickup' ? 'Pickup' : 'Delivery Fee'}</span>
                <span className="font-semibold">
                  {order.shippingPrice === 0 ? 'Free (Pickup)' : `ETB ${order.shippingPrice.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-semibold capitalize">
                  {order.deliveryType === 'pickup' ? '🏪 Store Pickup' : '🚚 Home Delivery'}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary-600">
                    ETB {order.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Update Status</h2>
            <div className="space-y-3">
              <button
                onClick={() => updateOrderStatus('processing')}
                disabled={updating || order.orderStatus === 'cancelled'}
                className="w-full btn-outline disabled:opacity-50"
              >
                Mark as Processing
              </button>
              {order.deliveryType !== 'pickup' && (
                <button
                  onClick={() => updateOrderStatus('shipped')}
                  disabled={updating || order.orderStatus === 'cancelled'}
                  className="w-full btn-outline disabled:opacity-50"
                >
                  Mark as Shipped
                </button>
              )}
              <button
                onClick={() => updateOrderStatus('delivered')}
                disabled={updating || order.orderStatus === 'cancelled'}
                className="w-full btn-outline disabled:opacity-50"
              >
                {order.deliveryType === 'pickup' ? 'Mark as Picked Up' : 'Mark as Delivered'}
              </button>
              <button
                onClick={() => updateOrderStatus('cancelled')}
                disabled={updating || order.orderStatus === 'delivered'}
                className="w-full btn-danger disabled:opacity-50"
              >
                Cancel Order
              </button>
            </div>

            {/* Tracking Number — only for delivery orders */}
            {order.deliveryType !== 'pickup' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <button
                  onClick={() => updateOrderStatus(order.orderStatus)}
                  disabled={updating}
                  className="w-full btn-primary mt-2 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? 'Saving...' : 'Save Tracking'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
