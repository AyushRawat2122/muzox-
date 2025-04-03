import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import Playlist from "../models/playlist.models.js";
import mongoose from "mongoose";
import Song from "../models/song.models.js";
import User from "../models/user.models.js";

//create PlayList
const createPlayList = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  const { _id } = req.user;

  if (!name || !description) {
    return next(new ApiError(400, "name and description are required"));
  }

  const playListCoverLocal = req.files?.playListCover?.[0]?.path;
  console.log(playListCoverLocal);
  let playListCover = undefined;
  const playlistSearch = await Playlist.findOne({ name: name });
  if (playlistSearch) {
    return next(new ApiError(400, "Playlist with this name already exists"));
  }
  if (playListCoverLocal) {
    console.log("Fssffs");
    playListCover = await uploadOnCloudinary(playListCoverLocal);
    console.log(playListCover);
    if (!playListCover) {
      return next(
        new ApiError(500, "something went wrong while uploading coverImg")
      );
    }
  } //we ll upload only if user wants to upload file if he doesnt it's okay

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
    .json(new ApiResponse(200, playlist, "playlist created successfully"));
}); //ok

//delete PlayList

const deletePlayList = asyncHandler(async (req, res, next) => {
  const { playListID } = req.params;
  const { _id } = req.user;

  if (playListID === "") {
    return next(new ApiError(400, "ID is not found try again later"));
  }

  const playList = await Playlist.findById(playListID);

  if (!playList) {
    return next(new ApiError(404, "Playlist not found"));
  }

  if (_id?.toString() !== playList?.owner?.toString()) {
    return next(
      new ApiError(400, "you are not authorized to delete this playlist")
    );
  }

  const picToDelete = playList?.playListCover?.public_id;
  if (picToDelete) {
    await deleteOnCloudinary(picToDelete);
  }
  await Playlist.findByIdAndDelete(playListID);
  return res
    .status(200)
    .json(new ApiResponse(200, "", "playlist deleted successfully"));
});

//add to PlayList
const addToPlayList = asyncHandler(async (req, res, next) => {
  const { playListID, songId } = req.params;
  const { _id } = req.user;

  const playlistsSongs = await Playlist.findById(playListID).select("songs");
  console.log(playlistsSongs);
  if (playlistsSongs?.songs?.some((song_id) => song_id.toString() === songId)) {
    return next(new ApiError(404, "Song already exists in the playlist"));
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      $and: [
        { _id: new mongoose.Types.ObjectId(playListID) },
        { owner: new mongoose.Types.ObjectId(_id) },
      ],
    },
    {
      $addToSet: {
        songs: new mongoose.Types.ObjectId(songId),
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(201)
    .json(
      new ApiResponse(200, playlist, "Song added to playlist successfully")
    );
});

//remove from PlayList
const removeFromPlayList = asyncHandler(async (req, res, next) => {
  const { playListID, songId } = req.params;
  const { _id } = req.user;
  const playlist = await Playlist.findById(playListID);
  if (!playlist) {
    return next(new ApiError(404, "Playlist or Song not found"));
  }
  if (playlist.owner?.toString() !== _id.toString()) {
    return new ApiError(400, "You are not the owner of this playlist");
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
        "song removed from playlist successfully"
      )
    );
});

//toggle playList publish status
const togglePlayListStatus = asyncHandler(async (req, res, next) => {
  const { playListID } = req.params;
  if (!playListID) {
    return next(
      new ApiError(400, "Playlist id is required to toggle publish status")
    );
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playListID,
    [{ $set: { publishStatus: { $not: "$publishStatus" } } }],
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist?.publishStatus,
        "Publish Status toggled successfully"
      )
    );
});

const searchPlaylist = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  const searchedSuggestion = await Playlist.aggregate([
    {
      $match: { name: { $regex: query, $options: "i" } },
    },
    { $limit: 10 },
    {
      $project: {
        uploadedBy: 0,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, searchedSuggestion, "Playlist fetched successfully")
    );
}); // umm we need to do regex thingy on this

// umm okay Idk much about this we ll see this while building frontend : )
const addThisPlaylist = asyncHandler(async (req, res, next) => {
  const { playListId } = req.params;

  if (!playListId) {
    return next(
      new ApiError(400, "Playlist id is required to add to User playlists")
    );
  }

  const { _id } = req.user;
  const userUpdatedPlaylist = await User.findByIdAndUpdate(
    _id,
    { $addToSet: { playlists: new mongoose.Types.ObjectId(playListId) } },
    { new: true }
  );
  if (userUpdatedPlaylist.modifiedCount <= 0) {
    return next(new ApiError(404, "Playlist is already saved in library"));
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

const removeFromLibrary = asyncHandler(async (req, res, next) => {
  const { playListId } = req.params;

  if (!playListId) {
    return next(
      new ApiError(400, "Playlist id is required to remove from User playlists")
    );
  }

  const { _id } = req.user;
  const userUpdatedPlaylist = await User.findByIdAndUpdate(
    _id,
    { $pull: { playlists: new mongoose.Types.ObjectId(playListId) } }, // 🔥 Remove playlist
    { new: true }
  );

  if (!userUpdatedPlaylist) {
    return next(new ApiError(400, "no playlist found associated with this id"));
  }

  return res.status(200).json(new ApiResponse(200, {}, "removed successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;

  const populatedPlaylists = await User.findById(_id)
    .populate("playlists")
    .select("playlists -_id");

  const userCreatedPlaylist = await Playlist.find({
    owner: new mongoose.Types.ObjectId(_id),
  });
  console.log();
  const data = [
    ...(populatedPlaylists.playlists || []),
    ...userCreatedPlaylist,
  ];

  return res.status(200).json(new ApiResponse(200, data, "User playlists"));
});

const getPlaylistSongs = asyncHandler(async (req, res, next) => {
  const { playListID } = req.params;
  if (!playListID) {
    return next(new ApiError(400, "playlistID required"));
  }
  const playlist = await Playlist.findById(playListID).populate("songs");
  if (!playlist) {
    return next(new ApiError(404, "playlist not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched Successfully"));
});

const forTheHomePage = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;

  //i want to exclude the playlist which are created by the users so this will be fetching all the playlist
  //which was created by the playlist now i will get the all the playlist and //yaa phir i can filter all the data which was created by the user
  const playlistsNotCreatedByUser = await Playlist.find({
    owner: { $ne: _id },
    publishStatus: true,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlistsNotCreatedByUser,
        "playlist for the home page"
      )
    );
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
