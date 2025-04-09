import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import Playlist from "../models/playlist.models.js";
import mongoose from "mongoose";
import Song from "../models/song.models.js";
import User from "../models/user.models.js";

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create PlayList
const createPlayList = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const { _id } = req.user;

  // Validate required fields
  if (!name || !description) {
    return next(new ApiError(400, "Name and description are required"));
  }

  // Validate user ID
  if (!isValidObjectId(_id)) {
    return next(new ApiError(400, "Invalid User ID"));
  }

  const playListCoverLocal = req.files?.playListCover?.[0]?.buffer;
  let playListCover;

  // Check for duplicate playlist name
  const playlistSearch = await Playlist.findOne({ name: name });
  if (playlistSearch) {
    return next(new ApiError(400, "Playlist with this name already exists"));
  }

  // Upload cover image if provided
  if (playListCoverLocal) {
    playListCover = await uploadOnCloudinary(playListCoverLocal);
    if (!playListCover) {
      return next(
        new ApiError(500, "Something went wrong while uploading cover image")
      );
    }
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    playListCover: playListCover
      ? { public_id: playListCover.public_id, url: playListCover.url }
      : undefined,
    songs: [],
    owner: new mongoose.Types.ObjectId(_id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

// Delete PlayList
const deletePlayList = asyncHandler(async (req, res, next) => {
  const { playListID } = req.params;
  const { _id } = req.user;

  if (!playListID || !isValidObjectId(playListID)) {
    return next(new ApiError(400, "Invalid playlist ID"));
  }

  // Validate user ID
  if (!isValidObjectId(_id)) {
    return next(new ApiError(400, "Invalid User ID"));
  }

  const playList = await Playlist.findById(playListID);
  if (!playList) {
    return next(new ApiError(404, "Playlist not found"));
  }

  if (_id.toString() !== playList.owner.toString()) {
    return next(
      new ApiError(400, "You are not authorized to delete this playlist")
    );
  }

  // Delete cover image from Cloudinary if it exists
  if (playList.playListCover?.public_id) {
    await deleteOnCloudinary(playList.playListCover.public_id);
  }

  await Playlist.findByIdAndDelete(playListID);
  return res
    .status(200)
    .json(new ApiResponse(200, "", "Playlist deleted successfully"));
});

// Add to PlayList
const addToPlayList = asyncHandler(async (req, res, next) => {
  const { playListID, songId } = req.params;
  const { _id } = req.user;

  // Validate IDs
  if (!isValidObjectId(playListID) || !isValidObjectId(songId)) {
    return next(new ApiError(400, "Invalid playlist or song ID"));
  }
  if (!isValidObjectId(_id)) {
    return next(new ApiError(400, "Invalid User ID"));
  }

  const playlistsSongs = await Playlist.findById(playListID).select("songs");
  if (playlistsSongs?.songs?.some((song_id) => song_id.toString() === songId)) {
    return next(new ApiError(404, "Song already exists in the playlist"));
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(playListID),
      owner: new mongoose.Types.ObjectId(_id),
    },
    { $addToSet: { songs: new mongoose.Types.ObjectId(songId) } },
    { new: true }
  );

  if (!playlist) {
    return next(
      new ApiError(404, "Playlist not found or you are not authorized")
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, playlist, "Song added to playlist successfully")
    );
});

// Remove from PlayList
const removeFromPlayList = asyncHandler(async (req, res, next) => {
  const { playListID, songId } = req.params;
  const { _id } = req.user;

  // Validate IDs
  if (!isValidObjectId(playListID) || !isValidObjectId(songId)) {
    return next(new ApiError(400, "Invalid playlist or song ID"));
  }
  if (!isValidObjectId(_id)) {
    return next(new ApiError(400, "Invalid User ID"));
  }

  const playlist = await Playlist.findById(playListID);
  if (!playlist) {
    return next(new ApiError(404, "Playlist or Song not found"));
  }
  if (playlist.owner.toString() !== _id.toString()) {
    return next(new ApiError(400, "You are not the owner of this playlist"));
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playListID,
    { $pull: { songs: songId } },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Song removed from playlist successfully"
      )
    );
});

// Toggle PlayList Publish Status
const togglePlayListStatus = asyncHandler(async (req, res, next) => {
  const { playListID } = req.params;
  if (!playListID || !isValidObjectId(playListID)) {
    return next(
      new ApiError(
        400,
        "Valid playlist ID is required to toggle publish status"
      )
    );
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playListID,
    [{ $set: { publishStatus: { $not: "$publishStatus" } } }],
    { new: true }
  );
  if (!playlist) {
    return next(new ApiError(404, "Playlist not found"));
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist.publishStatus,
        "Publish Status toggled successfully"
      )
    );
});

// Search Playlist
const searchPlaylist = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return next(new ApiError(400, "Search query is required"));
  }
  const searchedSuggestion = await Playlist.aggregate([
    { $match: { name: { $regex: query, $options: "i" } } },
    { $limit: 10 },
    { $project: { uploadedBy: 0 } },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, searchedSuggestion, "Playlist fetched successfully")
    );
});

// Add This Playlist to User Library
const addThisPlaylist = asyncHandler(async (req, res, next) => {
  const { playListId } = req.params;
  if (!playListId || !isValidObjectId(playListId)) {
    return next(
      new ApiError(
        400,
        "Valid playlist ID is required to add to User playlists"
      )
    );
  }
  const { _id } = req.user;
  if (!isValidObjectId(_id)) {
    return next(new ApiError(400, "Invalid User ID"));
  }

  const userUpdatedPlaylist = await User.findByIdAndUpdate(
    _id,
    { $addToSet: { playlists: new mongoose.Types.ObjectId(playListId) } },
    { new: true }
  );
  // If no changes occurred, it means the playlist is already in the user's collection.
  if (!userUpdatedPlaylist) {
    return next(
      new ApiError(404, "User not found or playlist already saved in library")
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userUpdatedPlaylist,
        "Playlist added to your collection successfully"
      )
    );
});

// Remove Playlist from User Library
const removeFromLibrary = asyncHandler(async (req, res, next) => {
  const { playListId } = req.params;
  if (!playListId || !isValidObjectId(playListId)) {
    return next(
      new ApiError(
        400,
        "Valid playlist ID is required to remove from User playlists"
      )
    );
  }
  const { _id } = req.user;
  if (!isValidObjectId(_id)) {
    return next(new ApiError(400, "Invalid User ID"));
  }
  const userUpdatedPlaylist = await User.findByIdAndUpdate(
    _id,
    { $pull: { playlists: new mongoose.Types.ObjectId(playListId) } },
    { new: true }
  );
  if (!userUpdatedPlaylist) {
    return next(new ApiError(400, "No playlist found associated with this id"));
  }
  return res.status(200).json(new ApiResponse(200, {}, "Removed successfully"));
});

// Get User Playlists
const getUserPlaylists = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  if (!isValidObjectId(_id)) {
    return next(new ApiError(400, "Invalid User ID"));
  }
  const populatedPlaylists = await User.findById(_id)
    .populate("playlists")
    .select("playlists -_id");

  const userCreatedPlaylist = await Playlist.find({
    owner: new mongoose.Types.ObjectId(_id),
  });
  const data = [
    ...(populatedPlaylists?.playlists || []),
    ...userCreatedPlaylist,
  ];
  return res.status(200).json(new ApiResponse(200, data, "User playlists"));
});

// Get Playlist Songs
const getPlaylistSongs = asyncHandler(async (req, res, next) => {
  const { playListID } = req.params;
  if (!playListID || !isValidObjectId(playListID)) {
    return next(new ApiError(400, "Valid playlist ID is required"));
  }
  const playlist = await Playlist.findById(playListID).populate("songs");
  if (!playlist) {
    return next(new ApiError(404, "Playlist not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

// For the Home Page (Fetch published playlists)
const forTheHomePage = asyncHandler(async (req, res, next) => {
  const playlists = await Playlist.find({ publishStatus: true }).limit(10);
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists for the home page"));
});

export {
  createPlayList,
  addToPlayList,
  removeFromPlayList,
  deletePlayList,
  togglePlayListStatus,
  searchPlaylist,
  getUserPlaylists,
  addThisPlaylist,
  getPlaylistSongs,
  removeFromLibrary,
  forTheHomePage,
};
