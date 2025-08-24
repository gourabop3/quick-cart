"use client";
import { useState, useEffect } from "react";
import { 
  ShoppingCartIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  CubeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { getToken } = useAppContext();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      
      // Fetch orders
      const ordersResponse = await axios.get("/api/order/list", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch products
      const productsResponse = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orders = ordersResponse.data.orders || [];
      const products = productsResponse.data.products || [];

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
      const recentOrders = orders.slice(0, 5); // Last 5 orders

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalCustomers: new Set(orders.map(order => order.userId)).size,
        recentOrders,
        topProducts: products.slice(0, 5) // Top 5 products
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {title === "Total Revenue" ? `$${value.toLocaleString()}` : value.toLocaleString()}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === "up" ? (
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${changeType === "up" ? "text-green-600" : "text-red-600"}`}>
                {change}% from last month
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-orange-100 rounded-lg">
          <Icon className="h-6 w-6 text-orange-600" />
        </div>
      </div>
    </div>
  );

  const RecentOrderCard = ({ order }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <ShoppingCartIcon className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Order #{order.orderId?.slice(-8) || order._id.slice(-8)}</p>
          <p className="text-sm text-gray-500">
            {new Date(order.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">${order.amount}</p>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          order.status === "Order Placed" ? "bg-blue-100 text-blue-800" :
          order.status === "Shipped" ? "bg-yellow-100 text-yellow-800" :
          order.status === "Delivered" ? "bg-green-100 text-green-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {order.status}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h1>
        <p className="text-orange-100">Here's what's happening with your store today.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCartIcon}
          change={12}
          changeType="up"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={CurrencyDollarIcon}
          change={8}
          changeType="up"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={CubeIcon}
          change={5}
          changeType="up"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={UsersIcon}
          change={15}
          changeType="up"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-600 mt-1">Latest customer orders</p>
          </div>
          <div className="p-6 space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, index) => (
                <RecentOrderCard key={order._id || index} order={order} />
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            <p className="text-sm text-gray-600 mt-1">Most popular items</p>
          </div>
          <div className="p-6 space-y-4">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CubeIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">${product.offerPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">#{index + 1}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/seller/add-product')}
            className="flex items-center justify-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors duration-200"
          >
            <CubeIcon className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-medium text-gray-900">Add Product</span>
          </button>
          <button 
            onClick={() => router.push('/seller/orders')}
            className="flex items-center justify-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          >
            <ShoppingCartIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">View Orders</span>
          </button>
          <button 
            onClick={() => router.push('/seller/product-list')}
            className="flex items-center justify-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors duration-200"
          >
            <ChartBarIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-gray-900">Manage Products</span>
          </button>
        </div>
      </div>
    </div>
  );
}
