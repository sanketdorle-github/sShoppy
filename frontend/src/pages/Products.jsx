import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaSpinner,
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { addToCart } from "../Redux/slices/cartSlice";
import { selectToken, selectIsAuthenticated } from "../Redux/slices/userSlice";
import { FaCartShopping } from "react-icons/fa6";

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState(""); // "price-asc" or "price-desc"
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [wishlist, setWishlist] = useState([]); // Array of product IDs
  const [wishlistProducts, setWishlistProducts] = useState([]); // Full product objects
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const observer = useRef();
  const lastProductElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (!hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            console.log("Loading more products triggered!");
            loadMoreProducts();
          }
        },
        {
          root: null,
          rootMargin: "200px",
          threshold: 0.1,
        },
      );

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore],
  );

  // Initial load
  useEffect(() => {
    loadProducts();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, []);

  // Fetch wishlist when user logs in/out
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setWishlistProducts([]);
    }
  }, [isAuthenticated]);

  // Load products when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      setProducts([]);
      loadProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy, minPrice, maxPrice]);

  // Fetch user's wishlist from API
  const fetchWishlist = async () => {
    if (!isAuthenticated || !token) return;

    setLoadingWishlist(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wishlist/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();
      console.log("Wishlist API Response:", result);

      if (result.success && response.ok) {
        const wishlistData = result.data || [];
        const wishlistIds = wishlistData.map((product) => product._id);

        setWishlist(wishlistIds);
        setWishlistProducts(wishlistData);

        console.log("Wishlist IDs:", wishlistIds);
        console.log("Wishlist Products:", wishlistData);
      } else {
        toast.error(result.message || "Failed to fetch wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      navigate("/login", { state: { from: "/products" } });
      return;
    }

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
      console.log("Toggle wishlist response:", result);

      if (result.success && response.ok) {
        const updatedWishlist = result.data || [];
        setWishlist(updatedWishlist);

        // Update wishlist products if we have product data
        const product = products.find((p) => p._id === productId);
        if (product) {
          if (updatedWishlist.includes(productId)) {
            // Added to wishlist
            setWishlistProducts((prev) => [...prev, product]);
            toast.success("Added to wishlist!");
          } else {
            // Removed from wishlist
            setWishlistProducts((prev) =>
              prev.filter((p) => p._id !== productId),
            );
            toast.success("Removed from wishlist!");
          }
        } else {
          // If we don't have product data, refetch the wishlist
          fetchWishlist();
          toast.success(
            updatedWishlist.includes(productId)
              ? "Added to wishlist!"
              : "Removed from wishlist!",
          );
        }
      } else {
        toast.error(result.message || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const fetchProductsFromAPI = async (pageNum) => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", pageNum);
    queryParams.append("limit", 12);

    if (searchTerm) queryParams.append("search", searchTerm);
    if (selectedCategory !== "all")
      queryParams.append("category", selectedCategory);

    if (sortBy === "price-asc") {
      queryParams.append("priceSort", "asc");
    } else if (sortBy === "price-desc") {
      queryParams.append("priceSort", "desc");
    }

    if (minPrice) queryParams.append("minPrice", minPrice);
    if (maxPrice) queryParams.append("maxPrice", maxPrice);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success && response.ok) {
        const apiProducts = result.data?.products || [];
        const pagination = result.data?.pagination || {};

        const {
          total = 0,
          page: currentPage = 1,
          totalPages: apiTotalPages = 1,
        } = pagination;

        return {
          success: true,
          products: apiProducts,
          pagination: {
            total,
            page: currentPage,
            totalPages: apiTotalPages,
          },
        };
      } else {
        toast.error(result.message || "Failed to fetch products");
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Network error. Please try again.");
      return { success: false, error: error.message };
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await fetchProductsFromAPI(1);

      if (result.success) {
        setProducts(result.products || []);
        setTotalProducts(result.pagination.total || 0);
        setTotalPages(result.pagination.totalPages || 1);
        setPage(result.pagination.page || 1);
        setHasMore(
          (result.pagination.page || 1) < (result.pagination.totalPages || 1),
        );
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const result = await fetchProductsFromAPI(nextPage);

      if (result.success) {
        const newProducts = result.products || [];
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const uniqueNewProducts = newProducts.filter(
            (p) => !existingIds.has(p._id),
          );
          return [...prev, ...uniqueNewProducts];
        });

        setTotalProducts(result.pagination.total || 0);
        setTotalPages(result.pagination.totalPages || 1);
        setPage(result.pagination.page || nextPage);
        setHasMore(
          (result.pagination.page || nextPage) <
            (result.pagination.totalPages || 1),
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Get unique categories from products
  const categories = [
    "all",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    const availableVariant = product.variants?.find((v) => v.stock > 0);

    if (!availableVariant) {
      toast.error("Product is out of stock");
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "https://via.placeholder.com/300",
        variant: {
          color: availableVariant.color,
          size: availableVariant.size,
          variantId:
            availableVariant._id ||
            `${product._id}_${availableVariant.color}_${availableVariant.size}`,
        },
        quantity: 1,
      }),
    );

    toast.success("Added to cart!");
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase");
      navigate("/login", { state: { from: "/products" } });
      return;
    }

    handleAddToCart(product);

    setTimeout(() => {
      navigate("/cart");
    }, 500);
  };

  const getTotalStock = (variants) => {
    return (
      variants?.reduce((total, variant) => total + (variant.stock || 0), 0) || 0
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const renderRating = (product) => {
    const rating = product.rating || 4.0;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
    setHasMore(true);
    setProducts([]);
    loadProducts();
  };

  const applyFilters = () => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    loadProducts();
    if (window.innerWidth < 768) {
      setShowMobileFilters(false);
    }
  };

  // Filter chip component
  const FilterChip = ({ label, onRemove, value }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 mr-2 mb-2">
      {label}: {value}
      <button
        onClick={onRemove}
        className="ml-2 text-blue-600 hover:text-blue-800"
      >
        ×
      </button>
    </span>
  );

  const activeFilters = [];
  if (searchTerm)
    activeFilters.push({
      label: "Search",
      value: searchTerm,
      remove: () => setSearchTerm(""),
    });
  if (selectedCategory !== "all")
    activeFilters.push({
      label: "Category",
      value: selectedCategory,
      remove: () => setSelectedCategory("all"),
    });
  if (sortBy === "price-asc")
    activeFilters.push({
      label: "Sort",
      value: "Price: Low to High",
      remove: () => setSortBy(""),
    });
  if (sortBy === "price-desc")
    activeFilters.push({
      label: "Sort",
      value: "Price: High to Low",
      remove: () => setSortBy(""),
    });
  if (minPrice)
    activeFilters.push({
      label: "Min Price",
      value: `$${minPrice}`,
      remove: () => setMinPrice(""),
    });
  if (maxPrice)
    activeFilters.push({
      label: "Max Price",
      value: `$${maxPrice}`,
      remove: () => setMaxPrice(""),
    });

  // Check if product is in wishlist
  const isProductInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="container mx-auto px-4">
        {/* Header with Wishlist Info */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Our Products
            </h1>
            <p className="text-gray-600">
              Discover amazing products tailored for you
            </p>
          </div>

          {isAuthenticated && (
            <div className="flex justify-center gap-2">
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => navigate("/user/cart")}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FaCartShopping className="h-5 w-5" />
                  <span>My cart</span>
                </button>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => navigate("/wishlist")}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <FaHeart className="h-5 w-5" />
                  <span>My Wishlist ({wishlist.length})</span>
                  {loadingWishlist && (
                    <FaSpinner className="h-4 w-4 animate-spin ml-2" />
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center md:text-right">
                  {wishlist.length} items saved
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full justify-center"
          >
            <FaFilter />
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div
            className={`${showMobileFilters ? "block" : "hidden"} md:block w-full md:w-1/4`}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset All
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Minimum Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Maximum Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By Price
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      setSortBy(sortBy === "price-asc" ? "" : "price-asc")
                    }
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${sortBy === "price-asc" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    <FaSortAmountDown />
                    Price: Low to High
                  </button>
                  <button
                    onClick={() =>
                      setSortBy(sortBy === "price-desc" ? "" : "price-desc")
                    }
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${sortBy === "price-desc" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    <FaSortAmountUp />
                    Price: High to Low
                  </button>
                </div>
              </div>

              {/* Apply Filters Button for Mobile */}
              <div className="md:hidden">
                <button
                  onClick={applyFilters}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full md:w-3/4">
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Active Filters
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap">
                  {activeFilters.map((filter, index) => (
                    <FilterChip
                      key={index}
                      label={filter.label}
                      value={filter.value}
                      onRemove={filter.remove}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Results Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-900">Products</h2>
                  <p className="text-gray-600 mt-1">
                    Showing{" "}
                    <span className="font-semibold">{products.length}</span> of{" "}
                    <span className="font-semibold">{totalProducts}</span>{" "}
                    products
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    {hasMore
                      ? "Scroll down to load more"
                      : "All products loaded"}
                  </div>
                  {isAuthenticated && (
                    <div className="flex items-center gap-1 text-sm text-pink-600">
                      <FaHeart className="h-4 w-4" />
                      <span>{wishlist.length} in wishlist</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading && products.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading products...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => {
                    const totalStock = getTotalStock(product.variants);
                    const isInWishlist = isProductInWishlist(product._id);
                    const isLastProduct = index === products.length - 1;

                    return (
                      <div
                        key={`${product._id}_${index}`}
                        ref={isLastProduct ? lastProductElementRef : null}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 relative"
                      >
                        {/* Wishlist Heart Badge */}
                        {isInWishlist && (
                          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-pink-500 text-white text-xs font-semibold rounded">
                            <FaHeart className="h-3 w-3 inline mr-1" />
                            Saved
                          </div>
                        )}

                        {/* Product Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={
                              product.images?.[0] ||
                              "https://via.placeholder.com/300"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300";
                            }}
                          />

                          {/* Wishlist Button */}
                          <button
                            onClick={() => toggleWishlist(product._id)}
                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                            title={
                              isInWishlist
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                            disabled={loadingWishlist}
                          >
                            {loadingWishlist ? (
                              <FaSpinner className="h-5 w-5 text-blue-600 animate-spin" />
                            ) : (
                              <FaHeart
                                className={`h-5 w-5 ${
                                  isInWishlist
                                    ? "text-pink-500 fill-current"
                                    : "text-gray-400 hover:text-pink-400"
                                }`}
                              />
                            )}
                          </button>

                          {/* Stock Badge */}
                          {totalStock === 0 && (
                            <div className="absolute top-12 right-3 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                              Out of Stock
                            </div>
                          )}

                          {/* Manual Product Badge */}
                          {product.source === "manual" && (
                            <div className="absolute bottom-3 left-3 px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
                              Premium
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {product.category || "Uncategorized"}
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                            {product.name}
                          </h3>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                            {product.description || "No description available"}
                          </p>

                          {/* Rating */}
                          <div className="mb-3">{renderRating(product)}</div>

                          {/* Price and Stock */}
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <span className="text-xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                            <div
                              className={`text-sm ${totalStock > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {totalStock > 0
                                ? `${totalStock} in stock`
                                : "Out of stock"}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {/* <div className="flex space-x-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={totalStock === 0 || !product.isActive}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title={
                                !isAuthenticated ? "Login to add to cart" : ""
                              }
                            >
                              <FaShoppingCart />
                              Add to Cart
                            </button>

                            <button
                              onClick={() => handleBuyNow(product)}
                              disabled={totalStock === 0 || !product.isActive}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title={!isAuthenticated ? "Login to buy now" : ""}
                            >
                              Buy Now
                            </button>
                          </div> */}

                          {/* View Details Button */}
                          <button
                            onClick={() => handleViewDetails(product._id)}
                            className="w-full mt-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                          >
                            View Details
                          </button>

                          {/* Variants Preview */}
                          {product.variants && product.variants.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="text-xs text-gray-500 mb-2">
                                Available in {product.variants.length} variants
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {[
                                  ...new Set(
                                    product.variants.map((v) => v.color),
                                  ),
                                ]
                                  .slice(0, 3)
                                  .map((color, idx) => (
                                    <div
                                      key={idx}
                                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                      title={`Available in ${color}`}
                                    >
                                      {color}
                                    </div>
                                  ))}
                                {[
                                  ...new Set(
                                    product.variants.map((v) => v.color),
                                  ),
                                ].length > 3 && (
                                  <div
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded"
                                    title={`${[...new Set(product.variants.map((v) => v.color))].length - 3} more colors`}
                                  >
                                    +
                                    {[
                                      ...new Set(
                                        product.variants.map((v) => v.color),
                                      ),
                                    ].length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Loading More Spinner */}
                {loadingMore && products.length > 0 && (
                  <div className="flex justify-center items-center py-8 mt-6">
                    <FaSpinner className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-600">
                      Loading more products...
                    </span>
                  </div>
                )}

                {/* End of Results Message */}
                {!hasMore && products.length > 0 && (
                  <div className="text-center py-8 mt-4">
                    <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg">
                      <p className="text-gray-600">
                        🎉 You've seen all {totalProducts} products!
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Page {page} of {totalPages}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
