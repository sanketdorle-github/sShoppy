import React from "react";
import { Link } from "react-router-dom";
import { FaBox, FaHeart, FaHistory, FaUser } from "react-icons/fa";

const UserDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back! Here's your account overview.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/user/orders"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaBox className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Orders</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Link>

        <Link
          to="/user/wishlist"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FaHeart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Wishlist</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </Link>

        <Link
          to="/user/orders"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FaHistory className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Orders</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Link>

        <Link
          to="/user/profile"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUser className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Profile</p>
              <p className="text-2xl font-bold">Complete</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  id: "#ORD-001",
                  date: "2024-01-15",
                  total: "$129.99",
                  status: "Delivered",
                },
                {
                  id: "#ORD-002",
                  date: "2024-01-10",
                  total: "$89.99",
                  status: "Processing",
                },
                {
                  id: "#ORD-003",
                  date: "2024-01-05",
                  total: "$249.99",
                  status: "Shipped",
                },
              ].map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {order.total}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
