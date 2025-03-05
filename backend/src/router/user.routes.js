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
  getUserPlaylist,
  userSongs,
  likedSong,
  refreshAccessToken,
} from "../controllers/user.controller.js";
const userRouter = express.Router();

userRouter.post(
  "/signup",
  uploader.fields([{ name: "profilePic", maxCount: 1 }]),
  signup
);

userRouter.post("/verifyUser/:userId", verifyUser);

userRouter.post("/login", login);

userRouter.get("/userDetails", authRequired, getCurrentUser);

userRouter.post("/logout", authRequired, logout);

userRouter.post("/PasswordResetMail",authRequired, passwordResetMail);

userRouter.post("/resetPassword", authRequired,resetPassword);

userRouter.get('/generateAccessToken',refreshAccessToken)

userRouter.post("/updateUserDetails", authRequired, updateUserDetails);

userRouter.post("/updateProfilePic", uploader.fields([{ name: "profilePic", maxCount: 1 }]),authRequired, updateProfilePic);

userRouter.get('/getPlaylist',authRequired,getUserPlaylist);

userRouter.get('/getMySongs',authRequired,userSongs);

userRouter.get('/myLikedSongs',authRequired,likedSong);

export default userRouter;
