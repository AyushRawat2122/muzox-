import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/mailer.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import Playlist from "../models/playlist.models.js";
import Song from "../models/song.models.js"
//will generate token
const tokenGenerators = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal Server Error");
  }
};

//sign up

const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  } // check that incoming body isn't empty

  const alreadyAUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (alreadyAUser) {
    throw new ApiError(400, "User already exists");
  }

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
    profilePic: {
      public_id: profilePic.public_id,
      url: profilePic.secure_url,
    },
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

const verifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { otp } = req.body;

  if (!userId || !otp) {
    throw new ApiError(400, "Please enter to confirm your validations");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified === true) {
    throw new ApiError(400, "User already verified");
  }

  if (user.verifyToken != otp) {
    throw new ApiError(400, "Invalid OTP");
  }

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

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    throw new ApiError(400, "Please enter your email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(400, "Please verify your account first");
  }

  const isPassWordCorrect = await user.comparePassword(password);

  if (!isPassWordCorrect) {
    throw new ApiError(400, "Invalid Email or  password");
  }

  const options = {
    secure: true,
    sameSite: "None",
    httpOnly: true,
  };

  const { accessToken, refreshToken } = tokenGenerators(user._id);
  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User verified successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return new ApiError(400, "Email field is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return new ApiError(404, "Please provide the valid email ");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiryDate = new Date(Date.now() + 600000);

  user.passwordToken = otp;

  user.passwordTokenExpiry = expiryDate;

  await sendEmail({
    email: email,
    otp: otp,
    name: username,
    type: "PASSWORD_RESET",
    userId: user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Email sent successfully to the User Email with a password reset follow the instructions to reset to password"
      )
    );
});

const passwordResetMail = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return new ApiError(404, "User not found");
  }

  const user = await User.findById(userId);

  if (!user) {
    return new ApiError(404, "User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiryDate = new Date(Date.now() + 600000);

  user.passwordToken = otp;

  user.passwordTokenExpiry = expiryDate;

  await sendEmail({
    email: email,
    otp: otp,
    name: username,
    type: "PASSWORD_RESET",
    userId: user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Email sent successfully to the User Email with a password reset follow the instructions to reset to password"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const currRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!currRefreshToken) return new ApiError(401, "No refresh token provided");

  const user = await User.findOne({ refreshToken: currRefreshToken }).select(
    "-refreshToken"
  );
  if (!user) return new ApiError(401, "Invalid refresh token");

  const { accessToken, refreshToken } = await generateAccessToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res.cookie("accessToken", accessToken, options);

  res.cookie("refreshToken", refreshToken, options);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Access token and refresh token generated successfully"
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  
  const { userId } = req.params;

  const { otp, newPassword } = req.body;

  if (!userId) {
    return new ApiError(404, "Page  Not Found");
  }

  if (otp === "" || newPassword === "") {
    return new ApiError(400, "OTP and New Password fields are required");
  }

  const user = await User.findById(userId);

  if (!user) {
    return new ApiError(404, "User not found Please try again later");
  }

  if (user.passwordToken !== otp) {
    return new ApiError(404, "Please enter the valid OTP");
  }

  if (new Date() > user.passwordTokenExpiry) {
    return new ApiError(404, "OTP has expired Please try again later");
  }

  const salt = await bcryptjs.genSalt(10);

  const hashedPassword = await bcryptjs.hashSync(password, salt);

  user.password = hashedPassword;

  user.passwordToken = null;

  user.passwordTokenExpiry = null;

  await user.save();

  return res

    .status(200)

    .json(new ApiResponse(200, "Password reset successfully"));
});

const logout = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const user = await User.findByIdAndUpdate(
    id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookies("accessToken", options)
    .clearCookies("refreshToken", options)
    .json(new ApiResponse(200, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "User found", req.user));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  //what do i want to change

  const { username, email } = req.body;

  const takenUserNameOrEmail = await User.findOne(
    $or[({ username }, { email })]
  );

  if (username === "" || email === "") {
    return res
      .status(400)
      .json(new ApiResponse(400, "Username and Email cannot be empty"));
  }

  if (takenUserNameOrEmail) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Username or Email already taken"));
  }

  const id = req.user._id;

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { username, email } },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "User details updated successfully", user));
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const profilePic = req.file?.path;

  if (!profilePic) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Please upload a profile picture"));
  }

  const user = await User.findById(req.user._id).select("avatar");

  const PF = await uploadOnCloudinary(profilePic);

  const avatarToDelete = user.profilePic.public_id;

  await User.findByIdAndUpdate(
    id,
    {
      $set: {
        profilePic: {
          public_id: PF.public_id,
          url: PF.secure_url,
        },
      },
    },
    { new: true }
  );

  if (avatarToDelete) {
    await deleteFromCloudinary(avatarToDelete);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile picture updated successfully", user));
});

const getUserPlaylist=asyncHandler(async(req,res)=>{
  const id=req.user._id;
  const playlists=await Playlist.findOne({owner:id});
  if(!playlists){
    return res.status(404).json(new ApiResponse(404, "No playlists found for this user"))
  }
  return res.status(200).json(new ApiResponse(200, "User playlists", playlists));
}); // risky

const userSongs = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const pipeline = [
    { $match: { userId: id } },
    {
      $lookup: {
        from: "users",       
        localField: "users",  
        foreignField: "_id",  
        as: "artist"
      }
    },
    { $unwind: "$artist" }    
  ];

  const songs = await Song.aggregate(pipeline);
  res.json(songs);
});

const likedSong = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sortField = req.query.sortField || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const customLabels = {
    totalDocs: "itemsCount",
    docs: "itemsList",
    nextPage: "next",
    prevPage: "prev",
    totalPage: "pagesCount",
    pagingCounter: "slNo",
    meta: "paginator"
  };

  const options = { page, limit, customLabels };

  const pipeline = [
    { $match: { userId: req.user._id } },
    { 
      $lookup: { 
        from: "songs", 
        localField: "songId", 
        foreignField: "_id", 
        as: "song" 
      } 
    },
    { $unwind: "$song" },
    { $sort: { [sortField]: sortOrder } }
  ];
  const likedSongs = await Song.aggregatePaginate(Song.aggregate(pipeline), options);
  res.json(likedSongs);
});

export default {
  signup,
  verifyUser,
  login,
  getUserDetails,
  forgotPassword,
  passwordResetMail,
  resetPassword,
  getUserPlaylist,
  updateProfilePic,
  updateUserDetails,
  getCurrentUser,
  logout,
  userSongs,
  likedSong,
  refreshAccessToken,
};
