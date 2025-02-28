import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import Song from "../models/song.models.js";
import mongoose from "mongoose";
import Like from "../models/like.models.js";
//upload song

const uploadSong = asyncHandler(async (req, res) => {
  const user = req.user; //this will come from middleware verifyJWT
  //where are you excepting it from ?
  //i have given it name authRequired situated in ../middleware/authRequired.middleware.js!

  const { title, artist, genre = "" } = req.body; //extract data from req body

  if (!title || !artist) {
    throw new ApiError(400, "title and artist are required");
  } // title and artist shouldnt be empty

  const localSongPath = req.files?.song?.[0]?.path;
  const localCoverImgPath = req.files?.coverImg?.[0]?.path;

  if (!localSongPath || !localCoverImgPath) {
    throw new ApiError(400, "cover and song both are required");
  } // files re mendatory to upload

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
    uploadedBy: mongoose.Types.ObjectId(user._id),
  });
  //creating document

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedSong, "song uploaded successfully"));
});

//delete song
const deleteSong = asyncHandler(async (req, res) => {
  const { public_id } = req.params; // take the video from params

  if (!public_id) {
    throw new ApiError(400, "public id is required to delete song");
  } //check there should be public_id

  const deleteStatus = await deleteOnCloudinary(public_id);
  //it will return true or false

  if (!deleteStatus) {
    throw new ApiError(
      500,
      "delete operation on song failed due to some unexpected reason"
    );
  } // if its false then error that operation is failed

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "successfully deleted the video"));
});

//search Song
const getSuggestionList = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const searchedSuggestion = await Song.aggregate([
    {
      $match: { title: { $regex: query } },
    },
    { $limit: 15 },
    {
      $project: {
        uploadedBy: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, searchedSuggestion, "songs fetched successfully")
    );
});

//get liked Songs
const getLikedSongs = asyncHandler(async (req, res) => {
  const { _id } = req.user; //extracting id from user request

  const likedSongs = await Like.aggregate([
    {
      $match: { likedBy: mongoose.Types.ObjectId(_id) },
    },
    {
      $lookup: {
        from: "songs",
        localField: "song",
        foreignField: "_id",
        as: "songDetailsArray",
        pipeline: [
          {
            $project: {
              uploadedBy: 0,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        songDetail: { $first: "$songDetailsArray" },
        isLiked: true,
      },
    },
    {
      $project: {
        songDetail: 1,
        isLiked: 1,
      },
    },
  ]); //aggregation PipeLine to get Liked Song

  return res
    .status(200)
    .json(new ApiResponse(200, likedSongs, "likedSongs fetched Successfully")); //return the liked song array
});

//like a song
const likeSong = asyncHandler(async (req, res) => {
  const { songId } = req.params; //extract incoming song id
  const { _id } = req.user; //extract incoming user _id
  const song = await Like.findOne({
    $and: [
      { song: mongoose.Types.ObjectId(songId) },
      { likedBy: mongoose.Types.ObjectId(_id) },
    ],
  });
  if (song) {
    throw new ApiError(400, "song is already liked");
  }

  const likedSong = await Like.create({
    song: mongoose.Types.ObjectId(songId),
    likedBy: mongoose.Types.ObjectId(_id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, likedSong, "liked the song"));
});

//dislike song
const unlikeSong = asyncHandler(async (req, res) => {
  const { songId } = req.params;
  const { _id } = req.user;

  const song = await Like.deleteOne({
    $and: [
      { song: mongoose.Types.ObjectId(songId) },
      { likedBy: mongoose.Types.ObjectId(_id) },
    ],
  });

  if (!song.deletedCount) {
    throw new ApiError(400, "not a liked song");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "", "successfully removed from liked song"));
});

export {
  uploadSong,
  deleteSong,
  getSuggestionList,
  getLikedSongs,
  likeSong,
  unlikeSong,
};
