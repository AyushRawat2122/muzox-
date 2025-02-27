import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const authRequired = asyncHandler(async (req, res , next) => {
  const token = req.cookies.accessToken;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer", "");
  }

  if (!token) {
    throw new ApiError(404, "User not Authorized");
  }
  
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const userId = decoded._id;

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User details"));
});

export default authRequired;
