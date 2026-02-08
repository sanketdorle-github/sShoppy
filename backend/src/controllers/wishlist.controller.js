import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId).populate({
    path: "wishlist",
    match: { isActive: true },
    select: "name price images category",
  });

  return res.status(200).json(new ApiResponse(200, user.wishlist || []));
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { productId } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const user = await User.findById(userId);

  const exists = user.wishlist.some((id) => id.toString() === productId);

  if (exists) {
    // ❌ Remove
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  } else {
    // ❤️ Add
    user.wishlist.push(productId);
  }

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.wishlist,
        exists ? "Removed from wishlist" : "Added to wishlist",
      ),
    );
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { productId } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const user = await User.findById(userId);

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user.wishlist, "Removed from wishlist"));
});
