import express from "express";
import signup from "../controllers/user.controller.js";
const userRouter=express.Router();
userRouter.post('/signup',signup);
export default userRouter;