import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/mailer.js";
import ApiResponse from "../utils/ApiResponse.js"; 


const signup = asyncHandler(async (req, res) => {
  const { username, email, password, profilePicture, coverPicture } = req.body;
  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const alreadyAUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (alreadyAUser) {
    throw new ApiError(400, "User already exists");
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryDate = new Date(Date.now() + 3600000);


  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
    profilePicture: profilePicture || "", 
    coverPicture: coverPicture || "",       
    verifyToken: otp,
    verifyTokenExpiry: expiryDate,
  });

  sendEmail({
    email,
    otp,
    username,
    option: "VERIFY",
    userId: user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, user, "User registered successfully"));
});

export default signup;
