import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaChevronLeft,
  FaMinus,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { addItemToCart } from "../Redux/slices/cartSlice";
import { selectToken, selectIsAuthenticated } from "../Redux/slices/userSlice";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Fetch product details
  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // Fetch related products when product is loaded
  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
      checkWishlistStatus();
    }
  }, [product]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        setProduct(result.data);

        // Set first available variant as default
        if (result.data.variants && result.data.variants.length > 0) {
          const availableVariant = result.data.variants.find(
            (v) => v.stock > 0,
          );
          if (availableVariant) {
            setSelectedVariant(availableVariant);
          }
        }
      } else {
        toast.error(result.message || "Product not found");
        navigate("/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    if (!product?.category) return;

    setLoadingRelated(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products?category=${product.category}&limit=4`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        // Filter out current product from related products
        const filteredProducts = (result.data?.products || []).filter(
          (p) => p._id !== productId,
        );
        setRelatedProducts(filteredProducts.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wishlist/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        const wishlistItems = result.data || [];
        setIsInWishlist(wishlistItems.some((item) => item._id === productId));
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      navigate("/login", { state: { from: `/product/${productId}` } });
      return;
    }

    setLoadingWishlist(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wishlist/toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        setIsInWishlist(!isInWishlist);
        toast.success(
          isInWishlist ? "Removed from wishlist" : "Added to wishlist!",
        );
      } else {
        toast.error(result.message || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingWishlist(false);
    }
  };

  // In ProductDetails.js, update the handleAddToCart function:

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login", { state: { from: `/product/${productId}` } });
      return;
    }

    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    if (selectedVariant.stock <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    if (quantity > selectedVariant.stock) {
      toast.error(`Only ${selectedVariant.stock} items available`);
      return;
    }

    try {
      await dispatch(
        addItemToCart({
          productId: product._id,
          color: selectedVariant.color,
          size: selectedVariant.size,
          quantity: quantity,
        }),
      ).unwrap();
        // toast.success(action.payload.message || "Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Update the handleBuyNow function:
  const handleBuyNow = async () => {
    try {
      await handleAddToCart();
      setTimeout(() => {
        navigate("/cart");
      }, 500);
    } catch (error) {
      console.error("Error in buy now:", error);
    }
  };

  const incrementQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity((prev) => prev + 1);
    } else if (!selectedVariant) {
      toast.error("Please select a variant first");
    } else {
      toast.error(`Only ${selectedVariant.stock} items available`);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const renderRating = (rating = 4.0) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} • 128 reviews
        </span>
      </div>
    );
  };

  const getAvailableColors = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map((v) => v.color))];
  };

  const getAvailableSizes = (color) => {
    if (!product?.variants) return [];
    return product.variants
      .filter((v) => v.color === color && v.stock > 0)
      .map((v) => v.size);
  };

  const handleColorSelect = (color) => {
    const variantsForColor = product.variants.filter((v) => v.color === color);
    const availableVariant = variantsForColor.find((v) => v.stock > 0);
    if (availableVariant) {
      setSelectedVariant(availableVariant);
      setQuantity(1);
    } else {
      toast.error("No stock available for this color");
    }
  };

  const handleSizeSelect = (size) => {
    const selectedColor = selectedVariant?.color;
    if (!selectedColor) {
      toast.error("Please select a color first");
      return;
    }

    const variant = product.variants.find(
      (v) => v.color === selectedColor && v.size === size,
    );

    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Product not found
          </h3>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center text-sm text-gray-600">
            <li>
              <button
                onClick={() => navigate("/products")}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <FaChevronLeft className="h-3 w-3" />
                Back to Products
              </button>
            </li>
            <li className="mx-2">/</li>
            <li className="text-gray-900 font-medium">{product.category}</li>
            <li className="mx-2">/</li>
            <li className="text-gray-900 font-semibold">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <img
                src={
                  product.images?.[selectedImage] ||
                  "https://via.placeholder.com/600"
                }
                alt={product.name}
                className="w-full h-[500px] object-contain p-8"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600";
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-blue-500" : "border-gray-200"}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <button
                  onClick={toggleWishlist}
                  disabled={loadingWishlist}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  {loadingWishlist ? (
                    <FaSpinner className="h-6 w-6 text-blue-600 animate-spin" />
                  ) : (
                    <FaHeart
                      className={`h-6 w-6 ${isInWishlist ? "text-pink-500 fill-current" : "text-gray-400"}`}
                    />
                  )}
                </button>
              </div>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">
                  {product.category}
                </span>
                {product.source === "manual" && (
                  <span className="ml-2 inline-block px-3 py-1 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full">
                    Premium
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="mb-6">{renderRating(product.rating)}</div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-sm ${selectedVariant?.stock > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {selectedVariant?.stock > 0
                      ? `${selectedVariant.stock} in stock`
                      : "Out of stock"}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {product.variants?.filter((v) => v.stock > 0).length || 0}{" "}
                    variants available
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description ||
                  "No description available for this product."}
              </p>
            </div>

            {/* Variants Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Select Options
              </h2>

              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Color:{" "}
                  <span className="font-semibold">
                    {selectedVariant?.color || "Select color"}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {getAvailableColors().map((color) => {
                    const variantsForColor = product.variants.filter(
                      (v) => v.color === color,
                    );
                    const hasStock = variantsForColor.some((v) => v.stock > 0);

                    return (
                      <button
                        key={color}
                        onClick={() => hasStock && handleColorSelect(color)}
                        disabled={!hasStock}
                        className={`px-4 py-2 rounded-lg border-2 ${
                          selectedVariant?.color === color
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        } ${!hasStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {color}
                        {!hasStock && " (Out of stock)"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              {selectedVariant?.color && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Size:{" "}
                    <span className="font-semibold">
                      {selectedVariant?.size || "Select size"}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {getAvailableSizes(selectedVariant.color).map((size) => {
                      const variant = product.variants.find(
                        (v) =>
                          v.color === selectedVariant.color && v.size === size,
                      );

                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size)}
                          className={`px-4 py-2 rounded-lg border-2 ${
                            selectedVariant?.size === size
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {size}
                          <span className="ml-2 text-xs text-gray-500">
                            ({variant?.stock || 0} left)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Quantity
                </h3>
                <div className="flex items-center">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaMinus className="h-4 w-4" />
                  </button>
                  <div className="px-6 py-2 border-t border-b border-gray-300 bg-gray-50 min-w-[60px] text-center">
                    {quantity}
                  </div>
                  <button
                    onClick={incrementQuantity}
                    disabled={
                      !selectedVariant || quantity >= selectedVariant.stock
                    }
                    className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaPlus className="h-4 w-4" />
                  </button>
                  <span className="ml-4 text-sm text-gray-500">
                    Max: {selectedVariant?.stock || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaShoppingCart className="h-6 w-6" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <FaTruck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-600">On orders over $50</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <FaShieldAlt className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">2-Year Warranty</h3>
                <p className="text-sm text-gray-600">Quality guaranteed</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <FaUndo className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">30-Day Returns</h3>
                <p className="text-sm text-gray-600">Easy return policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct._id}`)}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        relatedProduct.images?.[0] ||
                        "https://via.placeholder.com/300"
                      }
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {relatedProduct.category}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      <span
                        className={`text-xs ${relatedProduct.variants?.some((v) => v.stock > 0) ? "text-green-600" : "text-red-600"}`}
                      >
                        {relatedProduct.variants?.some((v) => v.stock > 0)
                          ? "In stock"
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {loadingRelated && (
              <div className="flex justify-center items-center py-8">
                <FaSpinner className="h-6 w-6 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">
                  Loading related products...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Product Specifications */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Product Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-gray-900">{product.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                <p className="text-gray-900">
                  {product.brand || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="text-gray-900">
                  {product.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Source</h3>
                <p className="text-gray-900 capitalize">{product.source}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Last Updated
                </h3>
                <p className="text-gray-900">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
