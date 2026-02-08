import express from "express";
import { sendEnquiry } from "../controllers/enquiry.controller.js";

const router = express.Router();

// POST /api/enquiry
router.post("/", sendEnquiry);

export default router;
