import express from "express";

import { authRequired } from "../middlewares/authRequired.middleware.js";

import uploader from "../middlewares/multer.middleware.js";

import {
  getCurrentUser,
  login,
  signup,
  verifyUser,
  logout,
  forgotPassword,
  passwordResetMail,
  resetPassword,
  updateUserDetails,
  updateProfilePic,
} from "../controllers/user.controller.js";
const userRouter = express.Router();

userRouter.post(
  "/signup",
  uploader.fields([{ name: "profilePic", maxCount: 1 }]),
  signup
);

userRouter.post("/verifyUser/:userId", verifyUser);

userRouter.post("/login", login);

userRouter.post("/userDetails", authRequired, getCurrentUser);

userRouter.post("/logout", authRequired, logout);

userRouter.post("/forgotPass", forgotPassword);

userRouter.get("/PasswordResetMail", passwordResetMail);

userRouter.post("/resetPassword", resetPassword);

userRouter.post("/updateUserDetails", authRequired, updateUserDetails);

userRouter.post("/updateProfilePic",uploader.single({
  name: "profilePic",
}),authRequired, updateProfilePic);

export default userRouter;
