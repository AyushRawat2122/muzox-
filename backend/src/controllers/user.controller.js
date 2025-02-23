import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/mailer.js";
import ApiResponse from "../utils/ApiResponse.js";

// access and refresh token generator function :

const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError("Error occured while generating user tokens", 500);
  }
};

//signup controller

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

// login controller

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError("Email or username is required", 400);
  } // checks that the both fields are mentioned

  const user = await User.findOne({
    $or: [{ email: email }, { username: username }],
  }); // gets the user

  if (!user) {
    throw new ApiError(
      "No user credentials found ,Please enter correct Email address"
    );
  }
  if (!user.isVerified) {
    throw new ApiError(
      "Your account is not verified, Please verify your Email address"
    );
  }

  const passwordStatus = await user.comparePassword(password);

  if (!passwordStatus) {
    throw new ApiError("Incorrect Password");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  const loggedInUser = await User.findById(user._id).select(
    "-password -verifyToken -verifyTokenExpiry -refreshToken -refreshTokenExpiry -passwordToken -passwordTokenExpiry"
  );

  return res
    .status(200)
    .cookie(accessToken, options)
    .cookie(refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});

export default signup;
