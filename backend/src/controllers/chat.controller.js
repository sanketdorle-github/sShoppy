import Faq from "../models/Faq.js";
import ChatLog from "../models/ChatLog.js";
import matchFAQ from "../utils/matcher.js";

const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    /* =========================
       1️⃣ Input Validation
    ========================== */

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message must be a string",
      });
    }

    const sanitizedMessage = message.trim();

    if (sanitizedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    if (sanitizedMessage.length > 500) {
      return res.status(413).json({
        success: false,
        message: "Message is too long (max 500 characters)",
      });
    }

    /* =========================
       2️⃣ Fetch FAQs
    ========================== */
    const faqs = await Faq.find().lean();

    if (!faqs || faqs.length === 0) {
      return res.status(503).json({
        success: false,
        message: "FAQ service unavailable. Please try again later.",
      });
    }

    /* =========================
       3️⃣ Match FAQ
    ========================== */
    const matchedFaq = matchFAQ(sanitizedMessage, faqs);

    const reply = matchedFaq
      ? matchedFaq.answer
      : "Sorry, I couldn't understand that. Please contact support.";

    /* =========================
       4️⃣ Save Chat Log (Non-blocking)
    ========================== */
    ChatLog.create({
      userMessage: sanitizedMessage,
      botReply: reply,
    }).catch((err) => {
      // Logging only, should NOT break user flow
      console.error("ChatLog save failed:", err.message);
    });

    /* =========================
       5️⃣ Success Response
    ========================== */
    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { chatWithBot };
