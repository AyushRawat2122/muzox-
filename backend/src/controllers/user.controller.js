import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/mailer.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

const tokenGenerators = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
};

//sign up

export const signup = asyncHandler(async (req, res) => {

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const alreadyAUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (alreadyAUser) {
    throw new ApiError(400, "User already exists");
  }

  console.log("hi");

  const profilePicLocal = req.files?.profilePic[0]?.path;

  console.log(profilePicLocal);

  const profilePic = await uploadOnCloudinary(profilePicLocal);

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryDate = new Date(Date.now() + 600000);

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
    profilePic: profilePic.url || "",
    verifyToken: otp,
    verifyTokenExpiry: expiryDate,
  });

  await sendEmail({
    email: email,
    otp: otp,
    name: username,
    type: "VERIFY",
    userId: user._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        "User registered successfully Now verify the code within 10 min to validate the process"
      )
    );
});

//verify user

export const verifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { otp } = req.body;

  if (!userId || !otp) {
    throw new ApiError(400, "Please enter to confirm your validations");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  console.log(user);

  if (user.verifyToken != otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  console.log("hello");

  //fucked upon this logic we need to think something about this

  if (Date.now() > user.verifyTokenExpiry) {

    await User.findByIdAndDelete(userId);
    await deleteOnCloudinary(user.profilePic);

    throw new ApiError(400, "OTP has expired.You need to signup again");

  }

  user.isVerified = true;
  user.verifyToken = null;
  user.verifyTokenExpiry = null;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User verified successfully"));

});

export const login = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  if (email === "" || password === "") {
    throw new ApiError(400, "Please enter your email and password");
  }

  const user = await User.findOne({ email });

  console.log(user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(400, "Please verify your account first");
  }
  
  const isPassWordCorrect = await bcryptjs.compare(password, user.password);

  if (!isPassWordCorrect) {
    throw new ApiError(400, "Invalid Email or  password");
  }
  

  const { accessToken, refreshToken } = tokenGenerators(user._id);
  res
    .cookie("accessToken", accessToken, {
      secure: true,
      sameSite: "None",
      httpOnly: true,
    })
    .cookie("refreshToken", refreshToken, {
      secure: true,
      sameSite: "None",
      httpOnly: true,
    });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User verified successfully"));
});

export default { signup, verifyUser, login };
