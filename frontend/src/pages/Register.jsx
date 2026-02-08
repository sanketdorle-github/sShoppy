import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  clearError,
  selectLoading,
  selectError,
  selectIsAuthenticated,
  selectUserRole,
} from "../Redux/slices/userSlice";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaCrown,
  FaUserPlus,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select state from Redux store
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain letters and numbers";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Prepare registration data (excluding confirmPassword)
    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    // Dispatch register action
    dispatch(registerUser(registrationData)).then((action) => {
      if (action.type === "user/register/fulfilled") {
        toast.success("Registration successful! You are now logged in.");

        // Small delay to show success message before redirect
        setTimeout(() => {
          if (formData.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }, 1500);
      }
    });
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });
    setErrors({});
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
            {/* <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <FaUserPlus className="h-8 w-8 text-white" />
              </div>
            </div> */}
            <h1 className="text-2xl font-bold text-white text-center">
              Create Account
            </h1>
            <p className="text-emerald-100 text-center mt-2">
              Join our community today
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
                  User Account
                </button>

                {/* <button
                  type="button"
                  onClick={() => setIsAdmin(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                    isAdmin
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaCrown className="h-4 w-4" />
                  Admin Account
                </button> */}
              </div>

              {isAdmin && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-purple-700">
                    <FaCrown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Admin account registration requires additional
                      verification.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
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
                    placeholder="Create a password (min. 6 chars)"
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
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters with letters and numbers
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Re-enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  required
                  disabled={loading}
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-700"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : isAdmin
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
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
                      Creating account...
                    </span>
                  ) : (
                    `Register as ${isAdmin ? "Admin" : "User"}`
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default Register;
