import mongoose from "mongoose";
import Faq from "../models/Faq.js";

/* ===============================
   CREATE FAQ
=============================== */
export const createFaq = async (req, res) => {
  try {
    const { question, answer, keywords } = req.body;

    // 1️⃣ Input Validation
    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Question is required and must be a non-empty string",
      });
    }

    if (question.trim().length > 300) {
      return res.status(413).json({
        success: false,
        message: "Question is too long (max 300 characters)",
      });
    }

    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answer is required and must be a non-empty string",
      });
    }

    if (answer.trim().length > 1000) {
      return res.status(413).json({
        success: false,
        message: "Answer is too long (max 1000 characters)",
      });
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Keywords must be a non-empty array",
      });
    }

    // Sanitize keywords
    const sanitizedKeywords = keywords
      .filter((k) => typeof k === "string" && k.trim().length > 0)
      .map((k) => k.trim().toLowerCase());

    if (sanitizedKeywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Keywords must contain at least one valid string",
      });
    }

    // 2️⃣ Create FAQ
    const faq = await Faq.create({
      question: question.trim(),
      answer: answer.trim(),
      keywords: sanitizedKeywords,
    });

    return res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    console.error("Create FAQ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ===============================
   GET ALL FAQS
=============================== */
export const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().lean();

    return res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    console.error("Get FAQs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/* ===============================
   DELETE FAQ
=============================== */
export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FAQ ID",
      });
    }

    const faq = await Faq.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete FAQ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
