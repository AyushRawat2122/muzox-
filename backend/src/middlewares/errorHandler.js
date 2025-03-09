import ApiError from "../utils/ApiError.js";
import { unlinkSync, readdirSync } from "fs";

const errorHandler = (error, req, res, next) => {
  let statusCode = error?.statusCode || 500; // takes status_code from error
  let message = error?.message || "Internal Server Error"; // Internal Server Error Default msg

  const files = readdirSync("./public/temp");
  files.forEach((file) => {
    if (file !== ".gitkeep") {
      unlinkSync(`./public/temp/${file}`);
    }
  });

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  } //Above is for if the error is coming from any other source

  return res.status(statusCode).json({ statusCode, message });
};

export default errorHandler;
