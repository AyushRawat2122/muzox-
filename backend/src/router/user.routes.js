import express from "express";

import { authRequired } from "../middlewares/authRequired.middleware.js";

import uploader from "../middlewares/multer.middleware.js";

import {
  getCurrentUser,
  login,
  signup,
  verifyUser,
  logout,
  passwordResetMail,
  resetPassword,
  updateUserDetails,
  updateProfilePic,
  refreshAccessToken,
  resetOtpVerification,
  verifyOtpResend,
} from "../controllers/user.controller.js";

import { getUserPlaylists } from "../controllers/playlist.controller.js";

const userRouter = express.Router();

userRouter.post(
  "/signup",
  uploader.fields([{ name: "profilePic", maxCount: 1 }]),
  signup
);

userRouter.post("/verifyUser/:email", verifyUser);

userRouter.post("/login", login);

userRouter.get("/userDetails", authRequired, getCurrentUser);

userRouter.post("/logout", authRequired, logout);

userRouter.post("/PasswordResetMail/:email", passwordResetMail);

userRouter.post("/resetPassword/:email", resetPassword);

userRouter.post("/otpVerification/:email", resetOtpVerification);

userRouter.get("/generateAccessToken", refreshAccessToken);

userRouter.post("/updateUserDetails", authRequired, updateUserDetails);

userRouter.post("/resendVerifyMail/:email", verifyOtpResend);

userRouter.post(
  "/updateProfilePic",
  uploader.fields([{ name: "profilePic", maxCount: 1 }]),
  authRequired,
  updateProfilePic
);

userRouter.get("/get-playlists", authRequired, getUserPlaylists);

export default userRouter;
