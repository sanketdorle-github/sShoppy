import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaShoppingBag,
  FaTruck,
  FaShieldAlt,
  FaStar,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaTag,
  FaUsers,
  FaAward,
} from "react-icons/fa";
import { selectIsAuthenticated } from "../Redux/slices/userSlice";

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // State for hero carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      title: "Summer Collection 2024",
      subtitle: "Discover the latest trends in fashion",
      description: "Get up to 50% off on all new arrivals",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      buttonText: "Shop Now",
      buttonColor: "bg-pink-600 hover:bg-pink-700",
      overlay: "bg-gradient-to-r from-pink-500/20 to-purple-500/20",
    },
    {
      id: 2,
      title: "Premium Electronics",
      subtitle: "Next Generation Technology",
      description: "Smart devices for your modern lifestyle",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      buttonText: "Explore Tech",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      overlay: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
    },
    {
      id: 3,
      title: "Home & Living",
      subtitle: "Create Your Dream Space",
      description: "Modern furniture and home essentials",
      image:
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      buttonText: "Shop Home",
      buttonColor: "bg-green-600 hover:bg-green-700",
      overlay: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
    },
  ];

  // Featured categories
  const categories = [
    {
      id: 1,
      name: "Fashion",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      count: "500+ Items",
      color: "bg-pink-500",
    },
    {
      id: 2,
      name: "Electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      count: "300+ Items",
      color: "bg-blue-500",
    },
    {
      id: 3,
      name: "Home & Living",
      image:
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      count: "250+ Items",
      color: "bg-green-500",
    },
    {
      id: 4,
      name: "Beauty",
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      count: "180+ Items",
      color: "bg-purple-500",
    },
  ];

  // Features
  const features = [
    {
      icon: <FaTruck className="h-8 w-8" />,
      title: "Free Shipping",
      description: "On orders over $50",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: <FaShieldAlt className="h-8 w-8" />,
      title: "Secure Payment",
      description: "100% secure & encrypted",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: <FaTag className="h-8 w-8" />,
      title: "Best Price",
      description: "Price match guarantee",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      icon: <FaUsers className="h-8 w-8" />,
      title: "24/7 Support",
      description: "Dedicated customer service",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Fashion Blogger",
      content:
        "The quality and service are exceptional! My go-to store for all fashion needs.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Tech Enthusiast",
      content:
        "Best prices for electronics with fast delivery. Highly recommended!",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 3,
      name: "Emma Wilson",
      role: "Interior Designer",
      content:
        "Beautiful home decor collection. The quality exceeds expectations.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    },
  ];

  // Auto slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured products
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products?limit=4&sortBy=popular`,
      );
      const result = await response.json();

      if (result.success && response.ok) {
        setFeaturedProducts(result.data?.products || []);
      }
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className={`absolute inset-0 ${slide.overlay} z-10`} />
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Slide Content */}
            <div
              className={`absolute inset-0 z-20 flex items-center transition-all duration-1000 ${
                index === currentSlide
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                    <span className="text-white font-semibold">
                      {slide.subtitle}
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl text-white/90 mb-8 max-w-lg">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => navigate("/products")}
                      className={`${slide.buttonColor} text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300`}
                    >
                      {slide.buttonText}
                      <FaArrowRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate("/products")}
                      className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/30 transition-colors duration-300"
                    >
                      Browse All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <FaChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          aria-label="Next slide"
        >
          <FaChevronRight className="h-6 w-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 z-30 animate-bounce">
          <div className="text-white text-center">
            <div className="text-sm mb-1">Scroll</div>
            <div className="h-8 w-px bg-white mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl hover:shadow-xl transition-shadow duration-300"
              >
                <div
                  className={`inline-flex p-4 rounded-full ${feature.bgColor} ${feature.color} mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600">Handpicked just for you</p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All Products
              <FaArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="group relative bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={
                        product.images?.[0] || "https://via.placeholder.com/400"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.source === "manual" && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        Premium
                      </div>
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaShoppingBag className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {renderStars(4.5)}
                      <span className="text-sm text-gray-500">
                        {product.variants?.filter((v) => v.stock > 0).length ||
                          0}{" "}
                        variants
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/80">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Premium Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80">Brand Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg">
              Join thousands of satisfied customers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-4">{renderStars(testimonial.rating)}</div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Shopping Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of satisfied customers and discover amazing
            products with exclusive benefits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <FaShoppingBag className="h-5 w-5" />
              Start Shopping Now
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Create Free Account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
