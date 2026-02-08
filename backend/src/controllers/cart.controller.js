import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateTotals } from "../utils/cart.utils.js";

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized access");
  }

  // 🛒 Find cart
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name price images isActive",
  });

  // 🟢 If no cart, return empty cart (don’t error)
  if (!cart) {
    return res.status(200).json(
      new ApiResponse(200, {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      }),
    );
  }

  // 🧹 Remove inactive or deleted products
  cart.items = cart.items.filter(
    (item) => item.product && item.product.isActive,
  );

  // 🧮 Calculate totals
  let totalItems = 0;
  let totalPrice = 0;

  cart.items.forEach((item) => {
    totalItems += item.quantity;
    totalPrice += item.quantity * item.price;
  });

  // Save cleaned cart (optional but recommended)
  await cart.save();

  return res.status(200).json(
    new ApiResponse(200, {
      cartId: cart._id,
      items: cart.items,
      totalItems,
      totalPrice,
    }),
  );
});

export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { productId, color, size, quantity = 1 } = req.body;

  // 🔐 Auth check
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // 🧪 Basic validation
  if (!productId || !color || !size) {
    throw new ApiError(400, "Product, color and size are required");
  }

  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  // 🛍 Find product
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 🎨 Find matching variant
  const variant = product.variants.find(
    (v) => v.color === color && v.size === size,
  );

  if (!variant) {
    throw new ApiError(400, "Selected variant not available");
  }

  // 📦 Stock check
  if (variant.stock < quantity) {
    throw new ApiError(400, "Insufficient stock");
  }

  // 🛒 Find or create cart
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  // 🔁 Check if item already exists in cart
  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.variant.color === color &&
      item.variant.size === size,
  );

  if (existingItem) {
    // Increment quantity
    if (existingItem.quantity + quantity > variant.stock) {
      throw new ApiError(400, "Exceeds available stock");
    }

    existingItem.quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      variant: { color, size },
      quantity,
      price: product.price, // 🔥 always backend-driven
    });
  }

  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

//update the cart
export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { productId, color, size, quantity } = req.body;

  // 🔐 Auth
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // 🧪 Validation
  if (!productId || !color || !size) {
    throw new ApiError(400, "Product, color and size are required");
  }

  if (quantity === undefined || quantity < 0) {
    throw new ApiError(400, "Quantity must be 0 or greater");
  }

  // 🛒 Find cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // 🔎 Find cart item
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.variant.color === color &&
      item.variant.size === size,
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not available");
  }

  const variant = product.variants.find(
    (v) => v.color === color && v.size === size,
  );

  if (!variant) {
    throw new ApiError(400, "Variant not available");
  }

  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    if (quantity > variant.stock) {
      throw new ApiError(400, "Requested quantity exceeds stock");
    }

    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart updated successfully"));
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { productId, color, size } = req.body;

  // 🔐 Auth check
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // 🧪 Validation
  if (!productId || !color || !size) {
    throw new ApiError(400, "Product, color and size are required");
  }

  // 🛒 Find cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // 🔍 Find item index
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.variant.color === color &&
      item.variant.size === size,
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart");
  }

  // ❌ Remove item
  cart.items.splice(itemIndex, 1);

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Item removed from cart"));
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  // 🔐 Auth check
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // 🛒 Find cart
  const cart = await Cart.findOne({ user: userId });

  // 🟢 If no cart, return success (idempotent)
  if (!cart) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          items: [],
        },
        "Cart already empty",
      ),
    );
  }

  // ❌ Clear items
  cart.items = [];

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

export const checkout = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // 2️⃣ Fetch cart
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price variants isActive",
    );
    console.log("cart", cart);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // 3️⃣ Validate items (stock + product status)
    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product unavailable`,
        });
      }

      const matchedVariant = product.variants.find(
        (v) => v.color === item.variant.color && v.size === item.variant.size,
      );

      if (!matchedVariant) {
        return res.status(400).json({
          success: false,
          message: `Variant not found for ${product.name}`,
        });
      }

      if (matchedVariant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

    // 4️⃣ Calculate totals
    const totals = calculateTotals(cart);

    // 5️⃣ Checkout summary (payment gateway comes later)
    return res.status(200).json({
      success: true,
      message: "Checkout successful",
      data: {
        cartItems: cart.items,
        summary: {
          totalItems: totals.totalItems,
          totalQuantity: totals.totalQuantity,
          subtotal: totals.subtotal,
          currency: "INR",
        },
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Checkout failed",
    });
  }
};
