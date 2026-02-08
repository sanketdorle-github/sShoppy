import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaUser,
  FaSpinner,
} from "react-icons/fa";

const Contact = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Contact info
  const contactInfo = [
    {
      icon: <FaPhone className="h-6 w-6" />,
      title: "Phone",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaEnvelope className="h-6 w-6" />,
      title: "Email",
      details: ["support@example.com", "sales@example.com"],
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaMapMarkerAlt className="h-6 w-6" />,
      title: "Address",
      details: ["123 Commerce Street", "New York, NY 10001", "United States"],
      color: "bg-red-100 text-red-600",
    },
    {
      icon: <FaClock className="h-6 w-6" />,
      title: "Business Hours",
      details: [
        "Monday - Friday: 9am - 6pm",
        "Saturday: 10am - 4pm",
        "Sunday: Closed",
      ],
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    if (formData.message.length < 10) {
      toast.error(
        "Please write a more detailed message (minimum 10 characters)",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/enquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Enquiry sent successfully!");

        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
        });

        // Show success message
        toast.info("Our team will contact you within 24 hours.");
      } else {
        toast.error(
          result.message || "Failed to send enquiry. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Have questions? We're here to help. Send us a message and we'll
              respond as soon as possible.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
              <FaPaperPlane className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">
                24-hour response time
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6 mb-12">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${info.color}`}>
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {info.title}
                      </h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Before You Send
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-600">
                    Include specific details for faster response
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-600">
                    Check our FAQ section for quick answers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-600">
                    For urgent matters, call our support line
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Send Your Enquiry
                </h2>
                <p className="text-gray-600">
                  Fill out the form below with your name, email, and message.
                  We'll get back to you promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaUser className="h-4 w-4 text-gray-400" />
                        Your Name *
                      </div>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="How can we help you today? Please provide as much detail as possible."
                      required
                    ></textarea>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        Minimum 10 characters
                      </span>
                      <span
                        className={`text-sm ${
                          formData.message.length < 10
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {formData.message.length}/1000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      formData.message.length < 10 ||
                      !formData.name ||
                      !formData.email
                    }
                    className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                      loading ||
                      formData.message.length < 10 ||
                      !formData.name ||
                      !formData.email
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-1"
                    } text-white`}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="h-5 w-5 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="h-5 w-5" />
                        Send Enquiry
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-600 text-center mt-4">
                    By submitting, you agree to our{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/privacy")}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Privacy Policy
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Response Time Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Response Time
                </h3>
                <p className="text-gray-600">
                  We aim to respond to all enquiries within 24 hours during
                  business days.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Urgent Support
                </h3>
                <p className="text-gray-600">
                  Need immediate help? Call us at{" "}
                  <span className="font-semibold text-blue-600">
                    +1 (555) 123-4567
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              See how we've helped businesses and individuals with their
              enquiries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Small Business Owner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Got a detailed response within 2 hours! The support team was
                incredibly helpful and solved my issue completely."
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaUser className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-sm text-gray-500">E-commerce Manager</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The enquiry process was smooth and straightforward. Received
                professional guidance that helped our business grow."
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaUser className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Emma Wilson</h4>
                  <p className="text-sm text-gray-500">Individual Customer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Quick response and excellent service. They went above and
                beyond to answer all my questions thoroughly."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
