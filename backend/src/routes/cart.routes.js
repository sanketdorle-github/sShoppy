import express from "express";
import {
  addToCart,
  checkout,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJWT, getCart);
router.post("/add", verifyJWT, addToCart);
router.put("/update", verifyJWT, updateCartItemQuantity);
router.delete("/remove", verifyJWT, removeFromCart);
router.delete("/clear", verifyJWT, clearCart);

router.get("/checkout", verifyJWT, checkout);
export default router;
