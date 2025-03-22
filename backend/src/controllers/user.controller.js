import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/mailer.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import Playlist from "../models/playlist.models.js";
import Song from "../models/song.models.js";
//will generate token
const tokenGenerators = async (userId) => {
  try {
    console.log("Reached token generators");

    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken || "";

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return next(new ApiError(500, "Internal Server Error"));
  }
};

//sign up

const signup = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new ApiError(400, "All fields are required"));
  } // check that incoming body isn't empty

  const alreadyAUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (alreadyAUser) {
    return next(new ApiError(400, "User already exists"));
  }

  const profilePicLocal = req.files?.profilePic?.[0]?.path;

  console.log(profilePicLocal);
  if (!profilePicLocal) {
    return next(new ApiError(400, "Please upload a profile picture"));
  }
  const profilePic = await uploadOnCloudinary(profilePicLocal);
  if (!profilePic) {
    return next(new ApiError(500, "Internal Serever Error plx try again later"));
  }
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

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user.id,
        email: user.email,
      },
      "User registered successfully Now verify the code within 10 min to validate the process"
    )
  );
});

//verify user

const verifyUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const { otp } = req.body;

  if (!userId || !otp) {
    return next(new ApiError(400, "Please enter to confirm your validations"));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  if (user.isVerified === true) {
    return next(new ApiError(400, "User already verified"));
  }

  if (user.verifyToken != otp) {
    return next(new ApiError(400, "Invalid OTP"));
  }

  //fucked upon this logic we need to think something about this

  if (Date.now() > user.verifyTokenExpiry) {
    await User.findByIdAndDelete(userId);
    await deleteOnCloudinary(user.profilePic);

    return next(new ApiError(400, "OTP has expired.You need to signup again"));
  }

  user.isVerified = true;
  user.verifyToken = null;
  user.verifyTokenExpiry = null;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "", "User verified successfully"));
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(email, password);

  if (email === "" || password === "") {
    return next(new ApiError(400, "Please enter your email and password"));
  }

  const user = await User.findOne({ email }).select(
    "-playlists -refreshToken -verifyToken -verifyTokenExpiry -passwordToken -passwordTokenExpiry"
  );

  console.log(user);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  if (!user.isVerified) {
    return next(new ApiError(400, "Please verify your account first"));
  }

  const isPassWordCorrect = await user.comparePassword(password);

  if (!isPassWordCorrect) {
    return next(new ApiError(400, "Invalid Email or password"));
  }

  const options = {
    secure: true,
    sameSite: "None",
    httpOnly: true,
  };

  const { accessToken, refreshToken } = await tokenGenerators(user._id);
  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        isPremiumUser: user.isPremiumUser,
      },
      "User LoggedIn successfully"
    )
  );
});

const passwordResetMail = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return next(new ApiError(404, "User not found"));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiryDate = new Date(Date.now() + 600000);

  user.passwordToken = otp;

  user.passwordTokenExpiry = expiryDate;
  await user.save();
  await sendEmail({
    email: user.email,
    otp: otp,
    name: user.username,
    type: "PASSWORD_RESET",
    userId: userId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Email sent successfully to the User Email with a password reset follow the instructions to reset to password"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const currRefreshToken = req.cookies?.refreshToken;
  if (!currRefreshToken) return next(new ApiError(401, "No refresh token provided"));

  const user = await User.findOne({ refreshToken: currRefreshToken }).select(
    "-refreshToken"
  );

  if (!user) return next(new ApiError(401, "Invalid refresh token"));
  const { accessToken, refreshToken } = await tokenGenerators(user._id);

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
        {},
        "Access token and refresh token generated successfully"
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { otp, newPassword } = req.body;
  if (!userId) {
    return next(new ApiError(404, "Page  Not Found"));
  }

  if (otp === "" || newPassword === "") {
    return next(new ApiError(400, "OTP and New Password fields are required"));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ApiError(404, "User not found Please try again later"));
  }

  console.log(typeof user.passwordToken);
  if (user.passwordToken !== otp) {
    return next(new ApiError(404, "Please enter the valid OTP"));
  }

  if (new Date() > user.passwordTokenExpiry) {
    return next(new ApiError(404, "OTP has expired Please try again later"));
  }

  const salt = await bcryptjs.genSalt(10);

  const hashedPassword = bcryptjs.hashSync(newPassword, salt);

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
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User found"));
});
const updateUserDetails = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username || username.trim() === "") {
    return next(new ApiError(400, "Username cannot be empty"));
  }

  const userId = req.user._id;

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return next(new ApiError(404, "User not found"));
  }

  if (currentUser.username === username) {
    return next(
      new ApiError(
        400,
        "New username must be different from the current username"
      )
    );
  }

  const isUsernameTaken = await User.findOne({ username });
  if (isUsernameTaken) {
    return next(new ApiError(400, "Username already taken"));
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { username },
    { new: true, runValidators: true }
  ).select(
    "-playlists -password -refreshToken -verifyToken -verifyTokenExpiry -passwordToken -passwordTokenExpiry"
  );

  if (!updatedUser) {
    return next(new ApiError(500, "User update failed"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User details updated successfully", updatedUser)
    );
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const profilePicLocal = req.files?.profilePic[0]?.path;
  if (!profilePicLocal) {
    return next(new ApiError(400, "Please upload a profile picture"));
  }
  const user = await User.findById(req.user._id).select("profilePic");
  console.log(user);
  const PF = await uploadOnCloudinary(profilePicLocal);
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
    await deleteOnCloudinary(avatarToDelete);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile picture updated successfully", user));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const playlists = await Playlist.findOne({ owner: id });
  if (!playlists) {
    return next(new ApiError(404, "No playlists found for this user"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User playlists", playlists));
}); // risky

const userSongs = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const pipeline = [
    { $match: { uploadedBy: id } },
    {
      $lookup: {
        from: "users",
        localField: "users",
        foreignField: "_id",
        as: "artist",
      },
    },
    { $unwind: "$artist" },
  ];

  const songs = await Song.aggregate(pipeline);
  res.json(songs);
}); // nhi  chahiye

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
    meta: "paginator",
  };

  const options = { page, limit, customLabels };
  const pipeline = [
    { $match: { userId: req.user._id } },
    {
      $lookup: {
        from: "songs",
        localField: "songId",
        foreignField: "_id",
        as: "song",
      },
    },
    { $unwind: "$song" },
    { $sort: { [sortField]: sortOrder } },
  ];
  const likedSongs = await Song.aggregatePaginate(
    Song.aggregate(pipeline),
    options
  );
  res.json(likedSongs);
}); //nhi chahiye

export {
  signup,
  verifyUser,
  login,
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
