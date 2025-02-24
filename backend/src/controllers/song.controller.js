import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import Song from "../models/song.models.js";
import mongoose from "mongoose";

//upload song

const uploadSong = asyncHandler(async (req, res) => {
  const user = req.user; //this will come from middleware verifyJWT

  const { title, artist, genre = "" } = req.body; //extract data from req body

  if (!title || !artist) {
    throw new ApiError(400, "title and artist are required");
  }// title and artist shouldnt be empty

  const localSongPath = req.files?.song[0]?.path;
  const localCoverImgPath = req.files?.coverImg[0]?.path;

  if (!localSongPath || !localCoverImgPath) {
    throw new ApiError(400, "cover and song both are required");
  }// files re mendatory to upload

  const song = await uploadOnCloudinary(localSongPath);
  const coverImg = await uploadOnCloudinary(localCoverImgPath);
  // uploading to cloudinary

  if (!song || !coverImg) {
    await deleteOnCloudinary(song?.public_id);
    await deleteOnCloudinary(coverImg?.public_id);
    throw new ApiError(500, "uploading song req to server failed unexpectedly");
  }
  //check for the successful upload

  const uploadedSong = await Song.create({
    title: title,
    artist: artist,
    genre: genre,
    url: song.url,
    coverImage: coverImg.url,
    duration: song?.duration,
    uploadedBy: new mongoose.Types.ObjectId(user._id),
  });
  //creating document 

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedSong, "song uploaded successfully"));
});

//delete song

//set publish status


export {uploadSong}