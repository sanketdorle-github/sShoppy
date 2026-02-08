import axios from "axios";
import Product from "../models/product.model.js";
import { sanitizeProduct } from "../utils/sanitizeProduct.js";

const EXTERNAL_API =
  process.env.EXTERNAL_API || "https://dummyjson.com/products";

export const syncProducts = async () => {
  try {
    console.log("🔄 Starting product sync...");

    const { data } = await axios.get(EXTERNAL_API);
    const products = data.products || [];

    console.log("📦 Products fetched:", products.length);

    for (const item of products) {
      const sanitized = sanitizeProduct(item);
      if (!sanitized) continue;

      await Product.updateOne(
        { externalId: sanitized.externalId },
        { $set: sanitized }, // ✅ allow updates
        { upsert: true },
      );
    }

    console.log("✅ Product sync completed");
  } catch (error) {
    console.error("❌ Product sync failed:", error);
  }
};
