import ApiError from "../utils/ApiError.js";

const errorHandler = (error, req, res, next) => {
  let statusCode = error?.statusCode || 500;
  let message = error?.message || "Internal Server Error";

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  return res.status(statusCode).json({ statusCode, message });
};

export default errorHandler;
