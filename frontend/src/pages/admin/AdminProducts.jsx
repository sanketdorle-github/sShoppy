import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaEllipsisV,
} from "react-icons/fa";
import {
  fetchProducts,
  deleteProduct,
  bulkDeleteProducts,
  toggleSelectProduct,
  selectAllProducts,
  clearSelectedProducts,
  setSearchQuery,
  setPage,
  selectProducts,
  selectLoading,
  selectPagination,
  selectedProducts,
  selectSearchQuery,
} from "../../Redux/slices/productsSlice";
import { selectToken } from "../../Redux/slices/userSlice";
import ProductModal from "../../components/ProductModal";

const AdminProducts = () => {
  const dispatch = useDispatch();

  // Select state from Redux
  const products = useSelector(selectProducts);
  const loading = useSelector(selectLoading);
  const pagination = useSelector(selectPagination);
  const selectedProductIds = useSelector(selectedProducts);
  const searchQuery = useSelector(selectSearchQuery);
  const token = useSelector(selectToken);

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showVariants, setShowVariants] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState({});

  // Debounce state
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounce function
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(setSearchQuery(value));
    }, 500), // 500ms delay
    [dispatch],
  );

  // Handle input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setInputValue("");
    dispatch(setSearchQuery(""));
  };

  // Fetch products on mount and when filters change
  useEffect(() => {
    if (token) {
      dispatch(
        fetchProducts({
          page: pagination.page,
          limit: pagination.limit,
          search: searchQuery,
          category: filterCategory,
          status: filterStatus,
        }),
      );
    }
  }, [
    dispatch,
    token,
    pagination.page,
    pagination.limit,
    searchQuery,
    filterCategory,
    filterStatus,
  ]);

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  // Handle delete product
  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) {
      toast.warning("Please select products to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedProductIds.length} selected products?`,
      )
    ) {
      dispatch(bulkDeleteProducts(selectedProductIds));
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // Handle add new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // Calculate total stock from variants
  const calculateTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  // Get unique categories from products
  const categories = [...new Set(products.map((p) => p.category))];

  // Toggle variant visibility
  const toggleVariantVisibility = (productId) => {
    setShowVariants((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Toggle mobile menu for product
  const toggleMobileMenu = (productId) => {
    setShowMobileMenu((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <div className="px-2 sm:px-4">
      {/* Header with Actions */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
          Products Management
        </h1>

        {/* Search and Filter Bar - Improved for mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={inputValue}
              onChange={handleSearchChange}
              className="w-full pl-9 sm:pl-10 pr-10 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {/* Clear search button */}
            {inputValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none justify-center"
            >
              <FaFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <button
              onClick={handleAddProduct}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
            >
              <FaPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Filters Panel - Improved for mobile */}
        {showFilters && (
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mb-3 sm:mb-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="font-medium text-gray-700 text-sm sm:text-base">
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterCategory("");
                    setFilterStatus("");
                  }}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions - Improved for mobile */}
        {selectedProductIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-blue-800 font-medium text-sm sm:text-base">
                {selectedProductIds.length} product(s) selected
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => dispatch(clearSelectedProducts())}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex-1 sm:flex-none justify-center"
                >
                  <FaTrash className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Loading products...
          </p>
        </div>
      )}

      {/* Products Table - Responsive */}
      {!loading && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow overflow-hidden">
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3 p-2">
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found
              </div>
            ) : (
              products.map((product) => {
                const totalStock = calculateTotalStock(product.variants);
                const isSelected = selectedProductIds.includes(product._id);

                return (
                  <div
                    key={product._id}
                    className={`border border-gray-200 rounded-lg p-3 relative ${
                      isSelected ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            dispatch(toggleSelectProduct(product._id))
                          }
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between relative">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-1">
                                {product.description}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleMobileMenu(product._id)}
                              className="ml-2 text-gray-500 hover:text-gray-700 relative z-10"
                            >
                              <FaEllipsisV className="h-5 w-5" />
                            </button>

                            {/* Mobile Dropdown Menu - Positioned relative to this container */}
                            {showMobileMenu[product._id] && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-32">
                                <button
                                  onClick={() => {
                                    handleEditProduct(product);
                                    setShowMobileMenu({});
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left border-b border-gray-100"
                                >
                                  <FaEdit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteProduct(product._id);
                                    setShowMobileMenu({});
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <FaTrash className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500">Price</div>
                              <div className="font-medium text-sm">
                                ${product.price?.toFixed(2) || "0.00"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Stock</div>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full inline-block ${
                                  totalStock > 50
                                    ? "bg-green-100 text-green-800"
                                    : totalStock > 20
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {totalStock} units
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {product.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleVariantVisibility(product._id)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-2 flex items-center gap-1"
                          >
                            {showVariants[product._id] ? (
                              <>
                                <FaEyeSlash className="h-3 w-3" />
                                Hide Variants
                              </>
                            ) : (
                              <>
                                <FaEye className="h-3 w-3" />
                                Show Variants ({product.variants?.length || 0})
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Variants Section - Mobile */}
                    {showVariants[product._id] &&
                      product.variants &&
                      product.variants.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="font-medium text-gray-700 text-sm mb-2">
                            Variants
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {product.variants
                              .slice(0, 4)
                              .map((variant, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-200 rounded p-2 text-xs"
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-medium">
                                        {variant.color}
                                      </div>
                                      <div className="text-gray-500">
                                        Size: {variant.size}
                                      </div>
                                    </div>
                                    <span
                                      className={`px-1.5 py-0.5 text-xs rounded-full ${
                                        variant.stock > 20
                                          ? "bg-green-100 text-green-800"
                                          : variant.stock > 5
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {variant.stock}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                          {product.variants.length > 4 && (
                            <div className="text-center mt-2 text-xs text-blue-600">
                              +{product.variants.length - 4} more variants
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedProductIds.length === products.length &&
                        products.length > 0
                      }
                      onChange={() => dispatch(selectAllProducts())}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const totalStock = calculateTotalStock(product.variants);
                    const isSelected = selectedProductIds.includes(product._id);

                    return (
                      <React.Fragment key={product._id}>
                        <tr className={isSelected ? "bg-blue-50" : ""}>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                dispatch(toggleSelectProduct(product._id))
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.images && product.images.length > 0 && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/50";
                                  }}
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                                <button
                                  onClick={() =>
                                    toggleVariantVisibility(product._id)
                                  }
                                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
                                >
                                  {showVariants[product._id] ? (
                                    <>
                                      <FaEyeSlash className="h-3 w-3" />
                                      Hide Variants
                                    </>
                                  ) : (
                                    <>
                                      <FaEye className="h-3 w-3" />
                                      Show Variants (
                                      {product.variants?.length || 0})
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 font-medium text-sm sm:text-base">
                              ${product.price?.toFixed(2) || "0.00"}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                totalStock > 50
                                  ? "bg-green-100 text-green-800"
                                  : totalStock > 20
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {totalStock} units
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="px-2 sm:px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${
                                product.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit"
                              >
                                <FaEdit className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete"
                              >
                                <FaTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Variants Section */}
                        {showVariants[product._id] &&
                          product.variants &&
                          product.variants.length > 0 && (
                            <tr className="bg-gray-50">
                              <td colSpan="7" className="px-4 sm:px-6 py-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                                  <h4 className="font-medium text-gray-700 text-sm sm:text-base mb-3">
                                    Product Variants
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                    {product.variants.map((variant, index) => (
                                      <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-2 sm:p-3"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                              <span className="font-medium text-gray-900 text-sm sm:text-base">
                                                {variant.color}
                                              </span>
                                              <span className="text-gray-500">
                                                •
                                              </span>
                                              <span className="text-gray-900 text-sm sm:text-base">
                                                Size: {variant.size}
                                              </span>
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                              Stock: {variant.stock} units
                                            </div>
                                          </div>
                                          <span
                                            className={`px-2 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full ${
                                              variant.stock > 20
                                                ? "bg-green-100 text-green-800"
                                                : variant.stock > 5
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {variant.stock <= 5
                                              ? "Low"
                                              : "In Stock"}
                                          </span>
                                        </div>
                                        {variant.images &&
                                          variant.images.length > 0 && (
                                            <div className="mt-2">
                                              <img
                                                src={variant.images[0]}
                                                alt={`${variant.color} ${variant.size}`}
                                                className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded"
                                                onError={(e) => {
                                                  e.target.src =
                                                    "https://via.placeholder.com/64";
                                                }}
                                              />
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Responsive */}
          {pagination.totalPages > 1 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="text-xs sm:text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  products
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded ${
                      pagination.page === 1
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: Math.min(3, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page === 1) {
                        pageNum = i + 1;
                      } else if (pagination.page === pagination.totalPages) {
                        pageNum = pagination.totalPages - 2 + i;
                      } else {
                        pageNum = pagination.page - 1 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded ${
                            pagination.page === pageNum
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  {pagination.totalPages > 3 &&
                    pagination.page < pagination.totalPages - 1 && (
                      <span className="px-1 sm:px-2 py-1 text-gray-500">
                        ...
                      </span>
                    )}

                  {pagination.totalPages > 3 &&
                    pagination.page < pagination.totalPages && (
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded ${
                          pagination.page === pagination.totalPages
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pagination.totalPages}
                      </button>
                    )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded ${
                      pagination.page === pagination.totalPages
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal product={editingProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default AdminProducts;
