import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle non-ApiError errors
  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorHandler };
