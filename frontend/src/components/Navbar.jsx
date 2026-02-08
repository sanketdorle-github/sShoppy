import React, { useState } from "react";
import {
  FaArrowRight,
  FaGlobe,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  logoutUser,
  selectIsAuthenticated,
  selectUser,
} from "../Redux/slices/userSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get auth state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowUserDropdown(false);
    navigate("/");
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
      <nav
        className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-12"
        aria-label="Global"
      >
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 flex items-center gap-0 p-1">
            <img
              src="./logo/logo.svg"
              alt="dShoppy-logo"
              className="h-8 w-auto"
            />
            <span className="text-blue-600 text-base font-semibold">
              dShoppy
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-1">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
          >
            Products
          </Link>

          <Link
            to="/contact"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
          >
            Contact
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex flex-1 justify-end">
          <div className="mr-4 flex items-center gap-4">
            {isAuthenticated ? (
              // User is logged in - Show user menu
              <div className="relative">
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaUserCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || "Account"}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      showUserDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2  border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                      {user?.role && (
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </div>

                    {/* <Link
                      to={
                        user?.role === "admin"
                          ? "/admin/dashboard"
                          : "/user/dashboard"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      My Orders
                    </Link> */}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FaSignOutAlt className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - Show login button
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
              >
                <span>Log in</span>
                <FaArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {/* Mobile Navigation Links */}
            <Link
              to="/"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={handleMobileLinkClick}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={handleMobileLinkClick}
            >
              Products
            </Link>

            <Link
              to="/contact"
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={handleMobileLinkClick}
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                {/* <div className="px-3 py-2 border-t border-gray-100 mt-2 pt-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{user?.email}</p>

                  <Link
                    to={
                      user?.role === "admin"
                        ? "/admin/dashboard"
                        : "/user/dashboard"
                    }
                    className="block rounded-lg px-3 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 mb-1"
                    onClick={handleMobileLinkClick}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={handleMobileLinkClick}
                  >
                    My Profile
                  </Link>
                </div> */}

                <button
                  onClick={() => {
                    handleLogout();
                    handleMobileLinkClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 mt-2"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block rounded-lg px-3 py-2 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 text-center mt-2"
                onClick={handleMobileLinkClick}
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
