import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.stats.totalUsers}
            icon={Users}
            color="bg-primary-600"
          />
          <StatCard
            title="Total Products"
            value={stats.stats.totalProducts}
            icon={Package}
            color="bg-accent-600"
          />
          <StatCard
            title="Total Orders"
            value={stats.stats.totalOrders}
            icon={ShoppingCart}
            color="bg-green-600"
          />
          <StatCard
            title="Total Revenue"
            value={`ETB ${stats.stats.totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-purple-600"
          />
        </div>
      )}

      {/* Order Status */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-2">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{stats.stats.processingOrders}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-2">Shipped</p>
            <p className="text-2xl font-bold text-purple-600">{stats.stats.shippedOrders}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-600 mb-2">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{stats.stats.deliveredOrders}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        {stats && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link to="/orders" className="flex items-center text-primary-600 hover:text-primary-700">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="space-y-4">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-semibold">#{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">{order.user?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">ETB {order.totalPrice.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 capitalize">{order.orderStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock Products */}
        {stats && stats.lowStockProducts.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Low Stock Alert
              </h2>
              <Link to="/inventory" className="flex items-center text-primary-600 hover:text-primary-700">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="space-y-4">
              {stats.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product._id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {product.stock} left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
