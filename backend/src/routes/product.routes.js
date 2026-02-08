import express from "express";
import {
  bulkDeleteProducts,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  hardDeleteProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { verifyJWT, isAdmin } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();
console.log("🚀 Product routes initialized"); // Debug log to confirm route setuSp
router.post(
  "/",
  verifyJWT,

  isAdmin,
  upload.fields([
    { name: "images", maxCount: 5 }, // product images
    { name: "variantImages_0", maxCount: 5 }, // variant 0
    { name: "variantImages_1", maxCount: 5 }, // variant 1
  ]),
  createProduct,
);
router.put(
  "/update/:productId",
  verifyJWT,
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "variantImages_0", maxCount: 5 },
    { name: "variantImages_1", maxCount: 5 },
  ]),
  updateProduct,
);

router.get("/", getProducts);
router.get("/:productId", getProductById);

router.delete("/:productId", verifyJWT, isAdmin, deleteProduct);

// Optional hard delete
router.delete("/hard/:productId", verifyJWT, isAdmin, hardDeleteProduct);

router.post("/test-upload", upload.any(), (req, res) => {
  res.json({ files: req.files });
});

router.post("/bulk-delete", verifyJWT, isAdmin, bulkDeleteProducts);
export default router;
