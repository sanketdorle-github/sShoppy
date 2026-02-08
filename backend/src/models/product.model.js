import mongoose from "mongoose";
/**
 * Variant Schema
 * Handles color + size + stock + images
 */
const variantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      enum: ["Black", "White", "Purple"],
      required: true,
    },
    size: {
      type: String,
      enum: ["S", "M", "L", "XL"],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

/**
 * Product Schema
 */
const productSchema = new mongoose.Schema(
  {
    // 🔗 Sync & Identity
    externalId: {
      type: String,
      unique: true,
      sparse: true, // allows admin-created products
    },
    source: {
      type: String,
      default: "manual", // dummyjson, fakestore, etc.
    },

    // 🛍 Product Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
    },

    // 🖼 Base images (fallback)
    images: {
      type: [String],
      default: [],
    },

    // 🎨 Variations
    variants: {
      type: [variantSchema],
      default: [],
    },

    // ⚙️ Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🧾 Meta
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
