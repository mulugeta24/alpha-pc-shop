import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [period, setPeriod] = useState('30');
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const [salesRes, productsRes, usersRes, ordersRes] = await Promise.all([
        api.get(`/analytics/sales?period=${period}`),
        api.get('/analytics/products'),
        api.get(`/analytics/users?period=${period}`),
        api.get(`/analytics/orders?period=${period}`)
      ]);

      setSalesData(salesRes.data.data);
      setProductData(productsRes.data.data);
      setUserData(usersRes.data.data);
      setOrderData(ordersRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const STATUS_COLORS = {
    processing: '#0ea5e9',
    shipped: '#a855f7',
    delivered: '#22c55e',
    cancelled: '#ef4444'
  };

  const orderStatusChartData = orderData
    ? Object.entries(orderData.ordersByStatus)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          color: STATUS_COLORS[status] || '#94a3b8'
        }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your store performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input-field w-32"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Sales Overview */}
      {salesData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-primary-600">
                  ETB {salesData.summary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{salesData.summary.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  ETB {Math.round(salesData.summary.averageOrderValue).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        {salesData && (
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Object.entries(salesData.salesByDate).map(([date, data]) => ({
                date,
                revenue: data.revenue,
                orders: data.orders
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#a855f7" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order Status Chart */}
        {orderData && (
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Order Status Distribution</h2>
            {orderStatusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={orderStatusChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {orderStatusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} orders`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    layout="horizontal"
                    wrapperStyle={{ paddingTop: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No order data for this period</p>
            )}
          </div>
        )}
      </div>

      {/* Top Products */}
      {productData && productData.topSellingProducts.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
          <div className="space-y-4">
            {productData.topSellingProducts.slice(0, 5).map((item, index) => (
              <div key={item.productId} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold mr-4">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-gray-500">{item.quantity} sold</p>
                  </div>
                </div>
                <p className="font-semibold text-primary-600">
                  ETB {item.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Growth */}
      {userData && (
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(userData.usersByDate).map(([date, count]) => ({
              date,
              users: count
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;
