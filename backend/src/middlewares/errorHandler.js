import ApiError from "../utils/ApiError.js";

const errorHandler = (error, req, res, next) => {
  let statusCode = error?.statusCode || 500; // takes status_code from error
  let message = error?.message || "Internal Server Error"; // Internal Server Error Default msg

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  }//Above is for if the error is coming from any other source

  return res.status(statusCode).json({ statusCode, message });
};

export default errorHandler;