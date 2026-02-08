import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaTimes,
  FaUpload,
  FaTrash,
  FaSpinner,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { createProduct, updateProduct } from "../Redux/slices/productsSlice";
import { selectToken } from "../Redux/slices/userSlice";

const colors = ["Black", "White", "Purple"];
const sizes = ["S", "M", "L", "XL"];

const ProductModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});
  const token = useSelector(selectToken);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    isActive: true,
    images: [],
    variants: [],
  });

  // Files state for upload
  const [mainImageFiles, setMainImageFiles] = useState([]);
  const [variantImageFiles, setVariantImageFiles] = useState({});

  // State for managing active variants
  const [activeVariants, setActiveVariants] = useState([]);

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      // Editing existing product - show all variants
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        brand: product.brand || "",
        isActive: product.isActive ?? true,
        images: product.images || [],
        variants: product.variants || [],
      });

      // For editing, show all variants that exist in the product
      setActiveVariants(
        product.variants?.map((v, index) => ({ ...v, index })) || [],
      );
    } else {
      // Creating new product - start with empty variants
      setFormData((prev) => ({
        ...prev,
        variants: [],
      }));
      setActiveVariants([]);
    }
  }, [product]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add a new variant
  const addVariant = () => {
    // Find available color-size combinations that aren't already added
    const availableCombinations = [];

    colors.forEach((color) => {
      sizes.forEach((size) => {
        const exists = activeVariants.some(
          (v) => v.color === color && v.size === size,
        );
        if (!exists) {
          availableCombinations.push({ color, size });
        }
      });
    });

    if (availableCombinations.length === 0) {
      toast.info("All color-size combinations are already added");
      return;
    }

    // Add the first available combination
    const newVariant = {
      ...availableCombinations[0],
      stock: 0,
      images: [],
    };

    const newIndex = formData.variants.length;
    setActiveVariants((prev) => [...prev, { ...newVariant, index: newIndex }]);
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  // Remove a variant
  const removeVariant = (variantIndex) => {
    setActiveVariants((prev) => prev.filter((v) => v.index !== variantIndex));

    // Remove variant image file if exists
    const variantKey = `${variantIndex}`;
    if (variantImageFiles[variantKey]) {
      setVariantImageFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[variantKey];
        return newFiles;
      });
    }

    // Remove from form data
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== variantIndex),
    }));

    // Reindex active variants
    setActiveVariants((prev) => prev.map((v, i) => ({ ...v, index: i })));
  };

  // Handle variant stock change
  const handleVariantStockChange = (variantIndex, stock) => {
    const updatedVariants = [...formData.variants];
    if (updatedVariants[variantIndex]) {
      updatedVariants[variantIndex].stock = parseInt(stock) || 0;
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));

      // Update active variants
      setActiveVariants((prev) =>
        prev.map((v) =>
          v.index === variantIndex ? { ...v, stock: parseInt(stock) || 0 } : v,
        ),
      );
    }
  };

  // Handle main image upload
  const handleMainImageUpload = async (files) => {
    const newFiles = Array.from(files);
    setMainImageFiles((prev) => [...prev, ...newFiles]);

    // Show preview for uploaded files
    const fileUrls = newFiles.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...fileUrls],
    }));
  };

  // Remove main image
  const removeMainImage = (index) => {
    setMainImageFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handle variant image upload
  const handleVariantImageUpload = async (variantIndex, file) => {
    if (!file) return;

    const variantKey = `${variantIndex}`;
    setUploadingImages((prev) => ({ ...prev, [variantKey]: true }));

    try {
      setVariantImageFiles((prev) => ({
        ...prev,
        [variantKey]: file,
      }));

      // Update variant with preview
      const updatedVariants = [...formData.variants];
      if (updatedVariants[variantIndex]) {
        updatedVariants[variantIndex].images = [URL.createObjectURL(file)];
        setFormData((prev) => ({ ...prev, variants: updatedVariants }));

        // Update active variants
        setActiveVariants((prev) =>
          prev.map((v) =>
            v.index === variantIndex
              ? { ...v, images: [URL.createObjectURL(file)] }
              : v,
          ),
        );
      }
    } catch (error) {
      toast.error("Failed to upload variant image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [variantKey]: false }));
    }
  };

  // Remove variant image
  const removeVariantImage = (variantIndex) => {
    const variantKey = `${variantIndex}`;
    setVariantImageFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[variantKey];
      return newFiles;
    });

    const updatedVariants = [...formData.variants];
    if (updatedVariants[variantIndex]) {
      updatedVariants[variantIndex].images = [];
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));

      // Update active variants
      setActiveVariants((prev) =>
        prev.map((v) => (v.index === variantIndex ? { ...v, images: [] } : v)),
      );
    }
  };

  // Prepare FormData for API
  const prepareFormData = async () => {
    const formDataObj = new FormData();

    // Add text fields
    formDataObj.append("name", formData.name);
    formDataObj.append("description", formData.description);
    formDataObj.append("price", formData.price);
    formDataObj.append("category", formData.category);
    formDataObj.append("brand", formData.brand || "");
    formDataObj.append("isActive", formData.isActive);

    // Add main images
    for (let i = 0; i < mainImageFiles.length; i++) {
      formDataObj.append("images", mainImageFiles[i]);
    }

    // Prepare variants array in the format [{"size": "S","color": "Black","stock": 10},...]
    const variantsData = [];

    for (let i = 0; i < formData.variants.length; i++) {
      const variant = formData.variants[i];

      // Only include variants with stock
      if (variant.stock > 0) {
        variantsData.push({
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
        });
      }
    }

    // Add variants as JSON string (only variants with stock)
    formDataObj.append("variants", JSON.stringify(variantsData));

    return formDataObj;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation (keep your existing validation code)
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Category is required");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }

    // Only require images for new products or if product has no images
    if (!product && mainImageFiles.length === 0) {
      toast.error("At least one main image is required for new products");
      return;
    }
    if (
      product &&
      mainImageFiles.length === 0 &&
      formData.images.length === 0
    ) {
      toast.error("Product must have at least one image");
      return;
    }

    const variantsWithStock = formData.variants.filter((v) => v.stock > 0);
    if (variantsWithStock.length === 0) {
      toast.error("At least one variant must have stock");
      return;
    }

    setLoading(true);

    try {
      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      const formDataObj = await prepareFormData();

      // Log FormData contents for debugging
      console.log("FormData entries:");
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}:`, value);
      }

      if (product) {
        // Update existing product
        const result = await dispatch(
          updateProduct({
            id: product._id,
            formDataObj: formDataObj,
          }),
        ).unwrap();

        if (result) {
          toast.success("Product updated successfully!");
          onClose();
        }
      } else {
        // Create new product
        const result = await dispatch(createProduct(formDataObj)).unwrap();

        if (result) {
          toast.success("Product created successfully!");
          onClose();
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total stock
  const calculateTotalStock = () => {
    return formData.variants.reduce(
      (total, variant) => total + (variant.stock || 0),
      0,
    );
  };

  // Get available color-size combinations
  const getAvailableCombinations = () => {
    const usedCombinations = activeVariants.map((v) => `${v.color}-${v.size}`);

    const available = [];
    colors.forEach((color) => {
      sizes.forEach((size) => {
        if (!usedCombinations.includes(`${color}-${size}`)) {
          available.push({ color, size });
        }
      });
    });

    return available;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., t-shirt, electronics"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Nike, Apple"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Product is active
                </label>
              </div>
            </div>

            {/* Right Column - Images & Summary */}
            <div className="space-y-4">
              {/* Main Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Images *
                  <span className="text-red-500 ml-1">(Required)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag & drop images or click to upload
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleMainImageUpload(e.target.files)}
                    className="hidden"
                    id="main-images-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="main-images-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Images
                  </label>
                </div>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Selected Images ({formData.images.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeMainImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={loading}
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">
                  Product Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Variants:</span>
                    <span className="font-medium">{activeVariants.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Variants with Stock:</span>
                    <span className="font-medium">
                      {formData.variants.filter((v) => v.stock > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Stock:</span>
                    <span className="font-medium">
                      {calculateTotalStock()} units
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Colors:</span>
                    <span className="font-medium">{colors.join(", ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Sizes:</span>
                    <span className="font-medium">{sizes.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Management */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                {product ? "Manage Variants" : "Add Variants"}
                <span className="text-red-500 ml-1 text-sm">
                  (At least one variant with stock is required)
                </span>
              </h3>

              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || getAvailableCombinations().length === 0}
              >
                <FaPlus className="h-4 w-4" />
                Add Variant
              </button>
            </div>

            {/* Available Combinations Info - Only for new products */}
            {!product &&
              activeVariants.length < colors.length * sizes.length && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Available combinations:</strong>{" "}
                    {getAvailableCombinations().length} of{" "}
                    {colors.length * sizes.length} remaining
                  </p>
                  <div className="mt-1 text-xs text-blue-600">
                    Colors: {colors.join(", ")} | Sizes: {sizes.join(", ")}
                  </div>
                </div>
              )}

            {activeVariants.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FaPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {product
                    ? "No variants found. Add variants to this product."
                    : "No variants added yet. Click 'Add Variant' to start adding variants."}
                </p>
                {!product && getAvailableCombinations().length > 0 && (
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Your First Variant
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeVariants.map((variant) => (
                    <div
                      key={`${variant.color}-${variant.size}-${variant.index}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 relative"
                    >
                      {/* Remove button - only for new products */}
                      {!product && (
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                          disabled={loading}
                        >
                          <FaMinus className="h-3 w-3" />
                        </button>
                      )}

                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {variant.color}
                          </div>
                          <div className="text-sm text-gray-500">
                            Size: {variant.size}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            variant.stock > 20
                              ? "bg-green-100 text-green-800"
                              : variant.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {variant.stock === 0
                            ? "No Stock"
                            : `${variant.stock} units`}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Stock Input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Stock Quantity *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) =>
                              handleVariantStockChange(
                                variant.index,
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="0"
                            disabled={loading}
                          />
                        </div>

                        {/* Variant Image Upload */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Variant Image
                            <span className="text-gray-500 ml-1">
                              (Optional)
                            </span>
                          </label>
                          <div className="relative">
                            {variant.images && variant.images.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={variant.images[0]}
                                  alt={`${variant.color} ${variant.size}`}
                                  className="h-12 w-12 object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeVariantImage(variant.index)
                                  }
                                  className="text-red-600 hover:text-red-800 p-1"
                                  disabled={loading}
                                >
                                  <FaTrash className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-gray-300 rounded p-2 text-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleVariantImageUpload(
                                      variant.index,
                                      e.target.files[0],
                                    )
                                  }
                                  className="hidden"
                                  id={`variant-image-${variant.index}`}
                                  disabled={
                                    loading ||
                                    uploadingImages[`${variant.index}`]
                                  }
                                />
                                <label
                                  htmlFor={`variant-image-${variant.index}`}
                                  className="cursor-pointer flex flex-col items-center"
                                >
                                  {uploadingImages[`${variant.index}`] ? (
                                    <FaSpinner className="h-5 w-5 text-blue-600 animate-spin mb-1" />
                                  ) : (
                                    <FaUpload className="h-5 w-5 text-gray-400 mb-1" />
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {uploadingImages[`${variant.index}`]
                                      ? "Uploading..."
                                      : "Upload Image"}
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add More Variants Button - Only for new products */}
                {getAvailableCombinations().length > 0 && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={addVariant}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                      disabled={loading}
                    >
                      <FaPlus className="h-4 w-4" />
                      Add Another Variant
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      {getAvailableCombinations().length} more combinations
                      available
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                formData.variants.filter((v) => v.stock > 0).length === 0 ||
                // For new products: require at least one image
                (!product && mainImageFiles.length === 0) ||
                // For editing: require at least one image (existing or new)
                (product &&
                  mainImageFiles.length === 0 &&
                  formData.images.length === 0)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[150px] justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
