import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema(
  {
    userMessage: String,
    botReply: String,
  },
  { timestamps: true },
);

const ChatLog = mongoose.model("ChatLog", chatLogSchema);
export default ChatLog;
