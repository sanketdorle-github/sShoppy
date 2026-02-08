import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 👤 Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // 🔐 never return password by default
    },

    // 🔐 Role & Access
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // 🛒 Optional (future use)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // ⚙️ Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
