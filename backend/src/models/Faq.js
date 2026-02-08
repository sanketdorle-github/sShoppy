import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: String,
  answer: String,
  keywords: [String],
});

const Faq = mongoose.model("Faq", faqSchema);
export default Faq;
