import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  clearError,
  selectLoading,
  selectError,
  selectIsAuthenticated,
  selectUserRole,
} from "../Redux/slices/userSlice";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaCrown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select state from Redux store
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [errors, setErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleToggle = () => {
    const newIsAdmin = !isAdmin;
    setIsAdmin(newIsAdmin);
    setFormData((prev) => ({
      ...prev,
      role: newIsAdmin ? "admin" : "user",
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Dispatch login action
    dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }),
    ).then((action) => {
      if (action.type === "user/login/fulfilled") {
        toast.success("Login successful!");

        // Navigation is handled by useEffect above
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            {/* <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <FaLock className="h-8 w-8 text-white" />
              </div>
            </div> */}
            <h1 className="text-2xl font-bold text-white text-center">
              Welcome Back
            </h1>
            <p className="text-blue-100 text-center mt-2">
              Sign in to your account
            </p>
          </div>

          <div className="p-8">
            {/* Role Toggle */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdmin(false)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                    !isAdmin
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaUser className="h-4 w-4" />
                  User Login
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdmin(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                    isAdmin
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaCrown className="h-4 w-4" />
                  Admin Login
                </button>
              </div>

              {isAdmin && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-purple-700">
                    <FaCrown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Admin mode enabled. Additional privileges will be granted.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : isAdmin
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  `Sign in as ${isAdmin ? "Admin" : "User"}`
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => navigate("/register")}
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <button className="text-gray-600 hover:text-gray-800">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-gray-600 hover:text-gray-800">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
