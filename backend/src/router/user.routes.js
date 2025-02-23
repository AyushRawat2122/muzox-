import express from "express";
import uploader from "../middlewares/multer.middleware.js";
import {login, signup,verifyUser} from "../controllers/user.controller.js";
const userRouter = express.Router();
userRouter.post(
  "/signup",
  uploader.fields([{ name: "profilePic", maxCount: 1 }]),
  signup
);
userRouter.post("/verifyUser/:userId",verifyUser);
userRouter.get('/login',login);
export default userRouter;
