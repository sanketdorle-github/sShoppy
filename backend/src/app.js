import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import authRouter from "./routes/auth.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import wishListRouter from "./routes/wishlist.routes.js";
import chatRouter from "./routes/chat.routes.js";
import faqRouter from "./routes/faq.routes.js";

import enquiryRoutes from "./routes/enquiry.routes.js";

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/wishlist", wishListRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/faq", faqRouter);
app.use("/api/v1/chat", chatRouter);

// Enquiry route
app.use("/api/v1/enquiry", enquiryRoutes);

//error handling middleware
app.use(errorHandler);
export { app };
