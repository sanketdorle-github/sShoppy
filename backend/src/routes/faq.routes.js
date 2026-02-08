import express from "express";
import {
  createFaq,
  getFaqs,
  deleteFaq,
} from "../controllers/faq.controller.js";
const router = express.Router();

router.post("/", createFaq);
router.get("/", getFaqs);
router.delete("/:id", deleteFaq);

export default router;
