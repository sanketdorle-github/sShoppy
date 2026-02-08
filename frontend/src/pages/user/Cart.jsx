import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaArrowRight,
  FaCreditCard,
  FaTruck,
  FaTag,
  FaShoppingBag,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  selectCartItems,
  selectCartLoading,
  selectCartSubtotal,
  selectCartTotal,
  selectCartTotalItems,
  selectCartDiscount,
  selectShippingAddress,
  selectShippingMethod,
  fetchCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
  checkoutCart,
  applyDiscount,
  removeDiscount,
  setShippingAddress,
  setShippingMethod,
} from "../../Redux/slices/cartSlice";
import {
  selectToken,
  selectIsAuthenticated,
} from "../../Redux/slices/userSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const items = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const totalItems = useSelector(selectCartTotalItems);
  const discount = useSelector(selectCartDiscount);
  const shippingAddress = useSelector(selectShippingAddress);
  const shippingMethod = useSelector(selectShippingMethod);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Local state
  const [discountCode, setDiscountCode] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingFormData, setShippingFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });
  const [selectedShipping, setSelectedShipping] = useState(
    shippingMethod || {
      id: "standard",
      name: "Standard Shipping",
      price: 5.99,
      estimatedDays: "5-7 business days",
    },
  );

  // Shipping options
  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Shipping",
      price: 5.99,
      estimatedDays: "5-7 business days",
    },
    {
      id: "express",
      name: "Express Shipping",
      price: 12.99,
      estimatedDays: "2-3 business days",
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      price: 24.99,
      estimatedDays: "1 business day",
    },
  ];

  // Fetch cart on component mount
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, token]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to view your cart");
      navigate("/login", { state: { from: "/cart" } });
    }
  }, [isAuthenticated, navigate]);

  // Update shipping method in Redux
  useEffect(() => {
    dispatch(setShippingMethod(selectedShipping));
  }, [selectedShipping, dispatch]);

  // Handle quantity increment
  const handleIncrement = async (item) => {
    if (item.quantity >= 99) {
      toast.error("Maximum quantity reached");
      return;
    }

    try {
      await dispatch(
        updateCartItem({
          productId: item.productId,
          color: item.variant.color,
          size: item.variant.size,
          quantity: item.quantity + 1,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Handle quantity decrement
  const handleDecrement = async (item) => {
    if (item.quantity <= 1) {
      // If quantity would become 0, remove the item instead
      handleRemoveItem(item);
      return;
    }

    try {
      await dispatch(
        updateCartItem({
          productId: item.productId,
          color: item.variant.color,
          size: item.variant.size,
          quantity: item.quantity - 1,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (item) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your cart?",
      )
    ) {
      try {
        await dispatch(
          removeItemFromCart({
            productId: item.productId,
            color: item.variant.color,
            size: item.variant.size,
          }),
        ).unwrap();
      } catch (error) {
        console.error("Error removing item:", error);
      }
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        await dispatch(clearCart()).unwrap();
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
  };

  // Handle apply discount
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    setApplyingDiscount(true);

    // Simulate API call - in real app, call your discount API
    setTimeout(() => {
      if (discountCode.toUpperCase() === "SAVE10") {
        dispatch(
          applyDiscount({
            code: discountCode.toUpperCase(),
            percentage: 10,
            amount: 0,
          }),
        );
        toast.success("Discount applied! 10% off your order");
      } else if (discountCode.toUpperCase() === "SAVE20") {
        dispatch(
          applyDiscount({
            code: discountCode.toUpperCase(),
            percentage: 20,
            amount: 0,
          }),
        );
        toast.success("Discount applied! 20% off your order");
      } else if (discountCode.toUpperCase() === "FIXED10") {
        dispatch(
          applyDiscount({
            code: discountCode.toUpperCase(),
            percentage: 0,
            amount: 10,
          }),
        );
        toast.success("$10 discount applied!");
      } else {
        toast.error("Invalid discount code");
      }

      setApplyingDiscount(false);
      setDiscountCode("");
    }, 1000);
  };

  // Handle remove discount
  const handleRemoveDiscount = () => {
    dispatch(removeDiscount());
    toast.info("Discount removed");
  };

  // Handle shipping form change
  const handleShippingFormChange = (e) => {
    const { name, value } = e.target;
    setShippingFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save shipping address
  const handleSaveShippingAddress = () => {
    if (
      !shippingFormData.fullName ||
      !shippingFormData.address ||
      !shippingFormData.city ||
      !shippingFormData.state ||
      !shippingFormData.zipCode ||
      !shippingFormData.country
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    dispatch(setShippingAddress(shippingFormData));
    setShowShippingForm(false);
    toast.success("Shipping address saved");
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Check if shipping address is set
    if (!shippingAddress) {
      toast.error("Please add a shipping address");
      setShowShippingForm(true);
      return;
    }

    setCheckingOut(true);

    try {
      const result = await dispatch(checkoutCart()).unwrap();
      toast.success("Checkout successful!");

      // Navigate to order confirmation or payment page
      // For now, clear cart and show success
      setTimeout(() => {
        dispatch(clearCart());
        navigate("/user/checkout/success", {
          state: {
            orderId: result.orderId || `ORD${Date.now()}`,
            total: total,
            items: items,
          },
        });
      }, 1000);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (discount.percentage > 0) {
      return subtotal * (discount.percentage / 100);
    }
    return discount.amount;
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading your cart...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <FaShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any products to your cart yet.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5" />
                  Continue Shopping
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => dispatch(fetchCart())}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ml-4"
                  >
                    <FaSpinner className="h-5 w-5" />
                    Refresh Cart
                  </button>
                )}
              </div>
            </div>

            {/* Recommended Products */}
            <div className="mt-12 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recommended For You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    onClick={() => navigate("/products")}
                    className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Popular Product {i}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Check out our best sellers
                    </p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Shop Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Shopping Cart
          </h1>
          <p className="text-gray-600">
            {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    Cart Items ({totalItems})
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-2"
                  >
                    <FaTrash className="h-4 w-4" />
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || "https://via.placeholder.com/150"}
                          alt={item.name}
                          className="h-32 w-32 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.variant.color} • Size: {item.variant.size}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-gray-400 hover:text-red-600 h-6 w-6"
                            title="Remove item"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleDecrement(item)}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrement(item)}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                              disabled={item.quantity >= 99}
                            >
                              <FaPlus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Summary Items */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {/* Shipping */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FaTruck className="h-4 w-4" />
                    Shipping
                  </h3>
                  <div className="space-y-2">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShipping.id === option.id}
                            onChange={() => setSelectedShipping(option)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <div>
                            <span className="font-medium">{option.name}</span>
                            <p className="text-sm text-gray-500">
                              {option.estimatedDays}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {formatPrice(option.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Discount */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FaTag className="h-4 w-4" />
                    Discount
                  </h3>
                  {discount.code ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium text-green-800">
                          {discount.code}
                        </span>
                        <p className="text-sm text-green-600">
                          {discount.percentage > 0
                            ? `${discount.percentage}% off`
                            : `${formatPrice(discount.amount)} off`}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-green-800 hover:text-green-900 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Enter discount code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={applyingDiscount || !discountCode.trim()}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingDiscount ? (
                          <FaSpinner className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span>{formatPrice(selectedShipping.price)}</span>
                </div>
                {discount.code && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount ({discount.code})</span>
                    <span>-{formatPrice(calculateDiscountAmount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Taxes calculated at checkout
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaTruck className="h-5 w-5" />
                Shipping Address
              </h2>

              {shippingAddress ? (
                <div className="space-y-2">
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p className="text-gray-600">{shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.zipCode}
                  </p>
                  <p className="text-gray-600">{shippingAddress.country}</p>
                  {shippingAddress.phone && (
                    <p className="text-gray-600">
                      Phone: {shippingAddress.phone}
                    </p>
                  )}
                  <button
                    onClick={() => setShowShippingForm(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4"
                  >
                    Edit Address
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaExclamationTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    No shipping address added
                  </p>
                  <button
                    onClick={() => setShowShippingForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Shipping Address
                  </button>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={checkingOut || items.length === 0}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {checkingOut ? (
                <>
                  <FaSpinner className="h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCreditCard className="h-6 w-6" />
                  Proceed to Checkout
                </>
              )}
            </button>

            {/* Payment Methods */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                Secure payment powered by Stripe
              </p>
              <div className="flex justify-center gap-4 mt-3">
                <div className="h-8 w-12 bg-gray-200 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address Modal */}
      {showShippingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Shipping Address
                </h2>
                <button
                  onClick={() => setShowShippingForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingFormData.fullName}
                    onChange={handleShippingFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingFormData.phone}
                    onChange={handleShippingFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingFormData.address}
                    onChange={handleShippingFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingFormData.city}
                    onChange={handleShippingFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingFormData.state}
                    onChange={handleShippingFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingFormData.zipCode}
                    onChange={handleShippingFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingFormData.country}
                    onChange={handleShippingFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowShippingForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveShippingAddress}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
