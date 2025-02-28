import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import Playlist from "../models/playlist.models.js";
import mongoose from "mongoose";

const createPlayList = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { _id } = req.user;
  // data extracted from req

  if (!name && !description) {
    throw new ApiError(400, "name and description are required");
  } // title and description about playlist required

  const playListCoverLocal = req.file?.playListCover?.[0]?.url;
  let playListCover = {};
  if (playListCoverLocal) {
    playListCover = await uploadOnCloudinary(playListCoverLocal);
    if (!playListCover) {
      throw new ApiError(500, "something went wrong while uploading coverImg");
    }
  } //we ll upload only if user wants to upload file if he doesnt it's okay

  await Playlist.create({
    name: name,
    description: description,
    playListCover: playListCover || "",
    songs: [],
    owner: mongoose.Types.ObjectId(_id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "", "playlist created successfully"));
});
