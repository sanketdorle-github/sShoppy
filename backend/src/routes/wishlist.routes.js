import { Router } from "express";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getWishlist);
router.post("/toggle", verifyJWT, toggleWishlist);
router.delete("/remove", verifyJWT, removeFromWishlist);

export default router;
