import nodemailer from "nodemailer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const sendEnquiry = asyncHandler(async (req, res, next) => {
  const { name, email, message } = req.body;

  // 1️⃣ Input Validation
  if (!name || !email || !message) {
    return next(new ApiError(400, "All fields are required"));
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return next(new ApiError(400, "Invalid field types"));
  }

  if (
    name.trim().length > 100 ||
    email.trim().length > 100 ||
    message.trim().length > 1000
  ) {
    return next(new ApiError(413, "One or more fields exceed max length"));
  }

  const sanitizedName = name.trim();
  const sanitizedEmail = email.trim();
  const sanitizedMessage = message.trim();

  // 2️⃣ Setup Nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${sanitizedName}" <${sanitizedEmail}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Enquiry from ${sanitizedName}`,
    text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\nMessage: ${sanitizedMessage}`,
    html: `<p><strong>Name:</strong> ${sanitizedName}</p>
           <p><strong>Email:</strong> ${sanitizedEmail}</p>
           <p><strong>Message:</strong> ${sanitizedMessage}</p>`,
  };

  // 3️⃣ Send Email
  await transporter.sendMail(mailOptions);

  // 4️⃣ Send Success Response
  return res
    .status(200)
    .json(new ApiResponse(true, "Enquiry sent successfully!"));
});
