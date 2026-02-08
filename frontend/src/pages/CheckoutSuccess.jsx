// pages/CheckoutSuccess.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaShoppingBag, FaHome } from "react-icons/fa";

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, items } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto text-center">
        <FaCheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Confirmed!
        </h1>

        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been confirmed and will be
          shipped soon.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-green-600">
                  ${total?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">
                  {items?.length || 0} item{items?.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            You will receive an email confirmation shortly with tracking
            information.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaShoppingBag className="h-5 w-5" />
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <FaHome className="h-5 w-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
