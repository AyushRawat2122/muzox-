import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/mailer.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary,deleteOnCloudinary } from "../utils/cloudinary.js";
export const signup = asyncHandler(async (req, res) => {
 /* //get user details from client
  //validate the details
  //now check the database using email or password
  //now check if image if it has came or not
  //if image is available then upload on SDK
  //hash the password
  //create otp for verification purpose
  //set expiry time for verification now
  //create the user in db [create the user]
  //once the user is created send email consisting of otp
  //if any error has came in response send that response
  //otherwise send the success response*/
  console.log("aya");
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
  const expiryDate = new Date(Date.now() + 3600000);
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
    .json(new ApiResponse(200, user, "User registered successfully"));
});
export const verifyUser=asyncHandler(async(req,res)=>{
   const { userId } = req.params;
   const { otp } = req.body;

  if (!otp) {
    // If no OTP  delete the user after 3 minutes
    setTimeout(async () => {
      const user=await User.findById(userId);
      await User.findByIdAndDelete(userId);
      const urlOfProfilePic=user.profilePic;
      await deleteOnCloudinary(urlOfProfilePic)
      console.log(`Unverified user ${userId} deleted both from db and cloudinary`);
    }, 180000); 
    throw new ApiError(400, "OTP required for verification");
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Match OTP
  if (user.verifyToken !== otp || user.verifyTokenExpiry < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // finally save 
  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  return res.status(200).json(new ApiResponse(200, user, "User verified successfully"));
})
export default {signup,verifyUser};
