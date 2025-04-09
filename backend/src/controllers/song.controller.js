import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import Song from "../models/song.models.js";
import mongoose from "mongoose";
import Like from "../models/like.models.js";
//upload song
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const uploadSong = asyncHandler(async (req, res, next) => {
  //this will come from middleware verifyJWT
  //where are you excepting it from ?
  //i have given it name authRequired situated in ../middleware/authRequired.middleware.js!
  const { title, artist, genre = "" } = req.body; //extract data from req body......
  if (!title || !artist) {
    return next(new ApiError(400, "title and artist are required"));
  } // title and artist shouldnt be empty

  const localSongPath = req.files?.song?.[0]?.buffer;
  const localCoverImgPath = req.files?.coverImage?.[0]?.buffer;

  const isPresent = await Song.findOne({
    $and: [{ title: title }, { artist: artist }],
  });
  if (isPresent) {

    return next(new ApiError(400, "song already exists"));
  }

  if (!localSongPath || !localCoverImgPath) {
    return next(new ApiError(400, "cover and song both are required"));
  } // files re mendatory to upload

  const song = await uploadOnCloudinary(localSongPath);
  const coverImg = await uploadOnCloudinary(localCoverImgPath);
  // uploading to cloudinary

  if (!song || !coverImg) {
    await deleteOnCloudinary(song?.public_id);
    await deleteOnCloudinary(coverImg?.public_id);
    return next(
      new ApiError(500, "uploading song req to server failed unexpectedly")
    );
  }
  //check for the successful upload
  const uploadedSong = await Song.create({
    title: title,
    artist: artist,
    genre: genre,
    song: { url: song.url, public_id: song.public_id },
    coverImage: { url: coverImg.url, public_id: coverImg.public_id },
    duration: song?.duration,
  });
  //creating document

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedSong, "song uploaded successfully"));
});

//search Song
const getSuggestionList = asyncHandler(async (req, res, next) => {
  const { query = "" } = req.query;
  const searchedSuggestion = await Song.aggregate([
    {
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { artist: { $regex: query, $options: "i" } },
        ],
      },
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
const getLikedSongs = asyncHandler(async (req, res, next) => {
  const { _id } = req.user; //extracting id from user request

  const likedSongs = await Like.aggregate([
    {
      $match: { likedBy: new mongoose.Types.ObjectId(_id) },
    },
    {
      $lookup: {
        from: "songs",
        localField: "song",
        foreignField: "_id",
        as: "songDetailsArray",
        pipeline: [
          {
            $addFields: {
              isLiked: true,
            },
          },
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
      },
    },
    {
      $project: {
        songDetail: 1,
        _id: 0,
      },
    },
    {
      $replaceRoot: { newRoot: "$songDetail" },
    },
  ]); //aggregation PipeLine to get Liked Song

  return res
    .status(200)
    .json(new ApiResponse(200, likedSongs, "likedSongs fetched Successfully")); //return the liked song array
});

//like a song
const likeSong = asyncHandler(async (req, res, next) => {
  const { songId } = req.params; //extract incoming song id
  const { _id } = req.user; //extract incoming user _id
  const song = await Like.findOne({
    $and: [
      { song: new mongoose.Types.ObjectId(songId) },
      { likedBy: new mongoose.Types.ObjectId(_id) },
    ],
  });
  if (song) {
    return next(new ApiError(400, "song is already liked"));
  }

  const likedSong = await Like.create({
    song: new mongoose.Types.ObjectId(songId),
    likedBy: new mongoose.Types.ObjectId(_id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, likedSong, "liked the song"));
});

//dislike song
const unlikeSong = asyncHandler(async (req, res, next) => {
  const { songId } = req.params;
  const { _id } = req.user;

  const song = await Like.deleteOne({
    $and: [
      { song: new mongoose.Types.ObjectId(songId) },
      { likedBy: new mongoose.Types.ObjectId(_id) },
    ],
  });

  if (!song.deletedCount) {
    return next(new ApiError(400, "not a liked song"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "", "successfully removed from liked song"));
});
const forTheUserHomePage = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;

  const likedDocs = await Like.find({ likedBy: _id })
    .select("song -_id")
    .lean();
  const likedSongIds = likedDocs.map((d) => d.song.toString());

  let recommendations = [];

  if (likedSongIds.length) {

    const artistsRaw = await Song.find({ _id: { $in: likedSongIds } })
      .select("artist -_id")
      .lean();
    const favArtists = [
      ...new Set(artistsRaw.map((s) => s.artist).filter(Boolean)),
    ];

    const regexList = favArtists.map((name) => {
      const esc = escapeRegExp(name.trim());
      return new RegExp(esc, "i");
    });

    const rawRecs = await Song.find({
      artist: { $in: regexList },
      _id: { $nin: likedSongIds },
    }).lean();

  
    const seen = new Set();
    recommendations = rawRecs.filter((song) => {
      const id = song._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  return res.status(200).json(new ApiResponse(200, recommendations, "Success"));
});
const newlyAddedSectionForHomePage = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const newlyAdded = await Song.find({}).sort({createdAt:-1}).limit(20);
  return res
    .status(200)
    .json(new ApiResponse(200, newlyAdded, "Newly Added Song"));
});

//exports
export {
  uploadSong,
  getSuggestionList,
  getLikedSongs,
  likeSong,
  unlikeSong,
  forTheUserHomePage,
  newlyAddedSectionForHomePage,
};
