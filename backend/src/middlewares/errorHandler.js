import ApiError from "../utils/ApiError.js";
import { unlinkSync, readdirSync, existsSync } from "fs";
import path from "path";

const errorHandler = (error, req, res, next) => {
  let statusCode = error?.statusCode || 500;
  let message = error?.message || "Internal Server Error";

  const tempDirPath = path.join(process.cwd(), "public", "temp");

  // ✅ Safe check: cleanup only if directory exists
  if (existsSync(tempDirPath)) {
    const files = readdirSync(tempDirPath);
    files.forEach((file) => {
      if (file !== ".gitkeep") {
        unlinkSync(path.join(tempDirPath, file));
      }
    });
  }

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  return res.status(statusCode).json({ statusCode, message });
};

export default errorHandler;
