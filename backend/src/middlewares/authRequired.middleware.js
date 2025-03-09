import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const authRequired = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer", "");
  }

  if (!token) {
    next(new ApiError(401, "User not Authorized"));
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const userId = decoded._id;

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    next(new ApiError(404, "User not found"));
  }
  req.user = user;
  next();
});

export default authRequired;
