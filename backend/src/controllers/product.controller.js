import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createProduct = asyncHandler(async (req, res) => {
  console.log("called create product");
  const { name, description, price, category, variants, brand } = req.body;
  //   console.log("FILES:", req.files);
  //   console.log("BODY:", req.body);

  // 🔴 Basic validation
  if (!name || !price) {
    throw new ApiError(400, "Product name and price are required");
  }

  // 🧩 Parse variants (multipart/form-data → string)
  let parsedVariants = [];
  if (variants) {
    try {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (err) {
      throw new ApiError(400, "Invalid variants JSON format");
    }
  }

  // 🧪 Validate variants
  if (!Array.isArray(parsedVariants)) {
    throw new ApiError(400, "Variants must be an array");
  }

  parsedVariants.forEach((variant, index) => {
    const { color, size, stock } = variant;

    if (!color || !size || stock === undefined) {
      throw new ApiError(
        400,
        `Variant at index ${index} is missing required fields`,
      );
    }
  });

  // 🖼 Upload base product images
  const productImages = [];
  if (req.files?.images?.length) {
    for (const file of req.files.images) {
      //   console.log("Uploading file:", file.path);
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded?.secure_url) {
        productImages.push(uploaded.secure_url);
      }
    }
  }

  // 🖼 Upload variant images (optional)
  for (let i = 0; i < parsedVariants.length; i++) {
    if (req.files?.[`variantImages_${i}`]) {
      parsedVariants[i].images = [];

      for (const file of req.files[`variantImages_${i}`]) {
        const uploaded = await uploadOnCloudinary(file.path);
        if (uploaded?.secure_url) {
          parsedVariants[i].images.push(uploaded.secure_url);
        }
      }
    }
  }

  // 🧾 Create product
  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    images: productImages,
    variants: parsedVariants,
    createdBy: req.user?._id,
    source: "manual",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, category, variants, brand } = req.body;
  //   console.log("Update Product - FILES:", req.files);
  //   console.log("Update Product - id:", productId);
  //   console.log("isValidObjectId:", mongoose.Types.ObjectId.isValid(productId));

  // 🔍 Check product exists
  const product = await Product.findById(productId);
  //   console.log("produt", product);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 🧩 Parse variants if provided
  let parsedVariants;
  if (variants) {
    try {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (error) {
      throw new ApiError(400, "Invalid variants JSON format");
    }

    if (!Array.isArray(parsedVariants)) {
      throw new ApiError(400, "Variants must be an array");
    }

    parsedVariants.forEach((variant, index) => {
      const { color, size, stock } = variant;
      if (!color || !size || stock === undefined) {
        throw new ApiError(
          400,
          `Variant at index ${index} is missing required fields`,
        );
      }
    });
  }

  // 🖼 Upload new base images (append, not replace)
  if (req.files?.images?.length) {
    for (const file of req.files.images) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded?.secure_url) {
        product.images.push(uploaded.secure_url);
      }
    }
  }

  // 🎨 Variant images update
  if (parsedVariants) {
    for (let i = 0; i < parsedVariants.length; i++) {
      if (req.files?.[`variantImages_${i}`]) {
        parsedVariants[i].images = parsedVariants[i].images || [];

        for (const file of req.files[`variantImages_${i}`]) {
          const uploaded = await uploadOnCloudinary(file.path);
          if (uploaded?.secure_url) {
            parsedVariants[i].images.push(uploaded.secure_url);
          }
        }
      }
    }

    product.variants = parsedVariants;
  }

  // 📝 Update primitive fields (only if sent)
  if (name) product.name = name;
  if (description) product.description = description;
  if (price !== undefined) product.price = price;
  if (category) product.category = category;
  if (brand) product.brand = brand;

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});
export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  // Admin can view inactive products
  if (req.user?.role === "admin") {
    delete filter.isActive;
  }

  // 🔍 Search by product name
  if (req.query.search) {
    filter.name = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  // 🏷 Category filter
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // 💰 Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) {
      filter.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.price.$lte = Number(req.query.maxPrice);
    }
  }

  // ↕️ Sorting
  let sortOption = { createdAt: -1 }; // default
  if (req.query.priceSort === "asc") {
    sortOption = { price: 1 };
  }
  if (req.query.priceSort === "desc") {
    sortOption = { price: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit).sort(sortOption),

    Product.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product || (!product.isActive && req.user?.role !== "admin")) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(new ApiResponse(200, product));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  product.isActive = false;
  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

export const hardDeleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product permanently deleted"));
});

export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  console.log("Bulk delte called");

  const { ids } = req.body;
  console.log("ids received:", ids);

  // 🔴 Validation
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "Product ids array is required");
  }

  // 🧪 Validate MongoDB ObjectIds
  const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

  if (invalidIds.length > 0) {
    throw new ApiError(400, `Invalid product IDs: ${invalidIds.join(", ")}`);
  }

  // 🗑 Bulk delete
  const result = await Product.deleteMany({
    _id: { $in: ids },
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "No products found to delete");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedCount: result.deletedCount,
      },
      "Products deleted successfully",
    ),
  );
});
