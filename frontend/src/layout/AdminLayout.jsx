import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectUser } from "../Redux/slices/userSlice";
import {
  FaTachometerAlt,
  FaUsers,
  FaShoppingBag,
  FaChartBar,
  FaCog,
  FaBox,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaHome,
  FaBell,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaQuestionCircle,
  FaEllipsisV,
} from "react-icons/fa";

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Set active menu based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find((item) => item.path === currentPath);
    if (activeItem) {
      setActiveMenu(activeItem.name);
    }
  }, [location]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaTachometerAlt className="h-5 w-5" />,
      badge: null,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <FaShoppingBag className="h-5 w-5" />,
      badge: "12",
    },
   
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation Bar - FIXED RESPONSIVE */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 lg:left-64 transition-all duration-300 shadow-sm"
        style={{ left: collapsed ? "5rem" : "" }}
      >
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          {/* Left Section - Mobile Menu & Brand */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <FaBars className="h-5 w-5 text-gray-600" />
            </button>

            {/* Brand/Title - Responsive */}
            <div className="flex items-center min-w-0">
              <h1 className="text-lg font-semibold text-gray-800 truncate sm:text-xl">
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden">A</span>
                <span className="hidden xs:inline sm:hidden">dmin</span>
              </h1>
              <span className="mx-2 text-gray-300 hidden sm:block">/</span>
              <span className="text-sm font-medium text-gray-600 truncate hidden sm:block">
                {activeMenu || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Center Section - Search (Hidden on small screens) */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xl">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Section - Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => {
                // Implement mobile search modal
                alert("Mobile search coming soon!");
              }}
              aria-label="Search"
            >
              <FaSearch className="h-5 w-5 text-gray-600" />
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100"
              aria-label={`${notifications} notifications`}
            >
              <FaBell className="h-5 w-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications > 9 ? "9+" : notifications}
                </span>
              )}
            </button>

            {/* Mobile More Menu */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="More options"
              >
                <FaEllipsisV className="h-5 w-5 text-gray-600" />
              </button>

              {showMobileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      // Add action here
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Desktop User Profile */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
                onClick={() => navigate("/admin/profile")}
                aria-label="User profile"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || "A"}
                </div>
              </button>
            </div>

            {/* Mobile User Profile */}
            <button
              className="md:hidden h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
              onClick={() => navigate("/admin/profile")}
              aria-label="User profile"
            >
              {user?.name?.charAt(0) || "A"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div
            ref={sidebarRef}
            className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ease-out"
          >
            <div className="p-4 h-full flex flex-col">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <span className="text-xl font-bold">Admin Panel</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="mb-6 p-4 bg-white/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaUserCircle className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{user?.name}</h3>
                    <p className="text-sm text-gray-300 truncate">
                      {user?.email}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-1 text-xs bg-blue-500 rounded-full">
                        {user?.role}
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-500 rounded-full">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-xs text-gray-300">Users</p>
                  <p className="text-xl font-bold">1.2K</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-xs text-gray-300">Orders</p>
                  <p className="text-xl font-bold">567</p>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? "bg-blue-500 text-white shadow-lg"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="mt-4 flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <FaSignOutAlt className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:block fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-30 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Logo and Collapse Toggle */}
            <div className="flex items-center justify-between mb-8">
              {!collapsed && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <span className="text-xl font-bold">Admin</span>
                </div>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <FaChevronRight className="h-4 w-4" />
                ) : (
                  <FaChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* User Info - Expanded Only */}
            {!collapsed && (
              <div className="mb-8 p-4 bg-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaUserCircle className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{user?.name}</h3>
                    <p className="text-sm text-gray-300 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs bg-blue-500 rounded-full">
                    {user?.role}
                  </span>
                  <span className="px-2 py-1 text-xs bg-green-500 rounded-full">
                    Online
                  </span>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-blue-500 text-white shadow-lg"
                      : "hover:bg-white/10"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.name : ""}
                  aria-label={item.name}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 flex items-center justify-center ${
                        location.pathname === item.path
                          ? "text-white"
                          : "text-gray-300"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {!collapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Bottom Section */}
            <div
              className={`mt-6 pt-6 border-t border-white/10 ${collapsed ? "text-center" : ""}`}
            >
              <div
                className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
              >
                {!collapsed && (
                  <Link
                    to="/admin/help"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                    aria-label="Help"
                  >
                    <FaQuestionCircle className="h-4 w-4" />
                    <span>Help</span>
                  </Link>
                )}
                {collapsed && (
                  <Link to="/admin/help" title="Help" aria-label="Help">
                    <FaQuestionCircle className="h-5 w-5 text-gray-400 hover:text-white" />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 text-red-400 hover:text-red-300 ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? "Logout" : ""}
                  aria-label="Logout"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  {!collapsed && <span className="text-sm">Logout</span>}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 min-h-screen transition-all duration-300 ${
            collapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Page Header - Only on larger screens (hidden on mobile since it's in top bar) */}
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 hidden lg:block">
                  {activeMenu || "Dashboard"}
                </h1>
                <p className="text-gray-600 mt-2 hidden lg:block">
                  Welcome back, {user?.name}. Here's what's happening with your
                  store today.
                </p>

                {/* Mobile Welcome */}
                <div className="lg:hidden bg-white rounded-xl p-4 shadow-sm mb-4">
                  <p className="text-sm text-gray-600">
                    Welcome back,{" "}
                    <span className="font-semibold text-gray-800">
                      {user?.name}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last login: Today at 09:42 AM
                  </p>
                </div>
              </div>

              {/* Stats Cards - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
                {[
                  {
                    title: "Revenue",
                    value: "$24.5K",
                    change: "+12.5%",
                    icon: "💰",
                    color: "bg-green-50",
                  },
                  {
                    title: "Orders",
                    value: "156",
                    change: "+8.2%",
                    icon: "📦",
                    color: "bg-blue-50",
                  },
                  {
                    title: "Customers",
                    value: "2.8K",
                    change: "+5.3%",
                    icon: "👥",
                    color: "bg-purple-50",
                  },
                  {
                    title: "Growth",
                    value: "32.4%",
                    change: "+4.1%",
                    icon: "📈",
                    color: "bg-orange-50",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.color} rounded-xl shadow p-4 sm:p-6 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {stat.title}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 truncate">
                          {stat.value}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {stat.change}
                        </p>
                      </div>
                      <div className="text-2xl sm:text-3xl ml-2">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="bg-white rounded-xl shadow-sm sm:shadow">
                <Outlet />
              </div>

              {/* Mobile Bottom Navigation (Optional) */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-40">
                <div className="grid grid-cols-4 gap-1">
                  {menuItems.slice(0, 4).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div
                        className={`h-6 w-6 flex items-center justify-center ${
                          location.pathname === item.path
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-xs mt-1 truncate">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
