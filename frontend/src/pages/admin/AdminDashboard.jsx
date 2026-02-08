import React from "react";
import {
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaChartLine,
} from "react-icons/fa";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      icon: <FaUsers />,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: "567",
      icon: <FaShoppingCart />,
      color: "bg-green-500",
    },
    {
      title: "Revenue",
      value: "$12,345",
      icon: <FaDollarSign />,
      color: "bg-purple-500",
    },
    {
      title: "Growth",
      value: "+12.5%",
      icon: <FaChartLine />,
      color: "bg-orange-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activities
        </h2>
        <div className="space-y-4">
          {[
            {
              user: "John Doe",
              action: "placed a new order",
              time: "5 minutes ago",
            },
            {
              user: "Jane Smith",
              action: "created an account",
              time: "1 hour ago",
            },
            {
              user: "Admin",
              action: "updated product prices",
              time: "2 hours ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <span className="font-medium">{activity.user}</span>{" "}
                {activity.action}
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
