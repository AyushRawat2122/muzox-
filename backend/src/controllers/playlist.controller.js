import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import Playlist from "../models/playlist.models.js";
import mongoose from "mongoose";
import Song from "../models/song.models.js";
import User from "../models/user.models.js";

//create PlayList
const createPlayList = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { _id } = req.user;

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
    playListCover: playListCover
      ? { public_id: playListCover.public_id, url: playListCover.url }
      : undefined,
    songs: [],
    owner: mongoose.Types.ObjectId(_id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "", "playlist created successfully"));
});

//delete PlayList

const deletePlayList = asyncHandler(async (req, res) => {
  const { playListID } = req.params;
  const { _id } = req.user;
  if (playListID === "") {
    return new ApiError(400, "ID is not found try again later");
  }
  const playList = await Playlist.findById(playListID);
  if (!playList) {
    throw new ApiError(404, "Playlist not found");
  }
  const picToDelete = playList.playListCover.public_id;
  if (picToDelete) {
    await deleteOnCloudinary(picToDelete);
  }
  await Playlist.findByIdAndDelete(playListID);
  return res
    .status(200)
    .json(new ApiResponse(200, "", "playlist deleted successfully"));
});

//add to PlayList
const addToPlayList = asyncHandler(async (req, res) => {
  const { playListID, songId } = req.params;
  //means i have to add songs to playlist
  const playlist = await Playlist.findById(playListID);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    return new ApiError(400, "You are not the owner of this playlist");
  }
  const song = await Song.findById(songId);
  if (!song) {
    throw new ApiError(404, "Playlist Not Found");
  }
  const songAlreadyInPlaylist = playlist.findOne({ songId });
  if (songAlreadyInPlaylist) {
    return new ApiError(400, "Song is already in the playlist");
  }
  playlist.songs.push(songId);
  await playlist.save();
  return res
    .status(201)
    .json(new ApiResponse(200, "", "song added to playlist successfully"));
}); // improvement :|

//remove from PlayList
const removeFromPlayList = asyncHandler(async (req, res) => {
  const { playListID, songId } = req.params;
  const playlist = await Playlist.findById(playListID);
  const song = await Song.findById(songId);
  if (!playlist || !song) {
    throw new ApiError(404, "Playlist or Song not found");
  }
  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    return new ApiError(400, "You are not the owner of this playlist");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playListID,
    { $pull: { songs: songId } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "", "song removed from playlist successfully"));
});

//toggle playList publish status
const togglePlayListStatus = asyncHandler(async (req, res) => {
  const { playListID } = req.params;
  if (!playListID) {
    throw new ApiError(400, "Playlist id is required to toggle publish status");
  }
  await Playlist.findByIdAndUpdate(
    playListID,
    [{ $set: { publishStatus: { $not: "$publishStatus" } } }],
    { new: true }
  );
  return new ApiResponse(200, "", "Publish Status toggled successfully");
});

const searchPlaylist = asyncHandler(async (req, res) => {
  const { nameOfPlaylist } = req.body;
  if (!nameOfPlaylist || nameOfPlaylist.trim() === "") {
    return new ApiError(400, "Playlist name is required");
  }

  const userId = req.user && req.user._id;
  if (!userId) {
    return new ApiError(401, "You are not logged in");
  }

  const user = await User.findById(userId).populate("playlists");
  if (!user) {
    return new ApiError(404, "User not found");
  }
  const playlistFound = user.playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(nameOfPlaylist.toLowerCase())
  );

  res.status(200).json({ playlists: playlistFound });
}); // umm we need to do regex thingy on this

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.user._id;
  const user = await User.findById(userId);
  const playlists = await Playlist.find({ owner: userId }).populate("songs");
  if (!playlists) {
    return new ApiError(404, "Playlist not found");
  }

  const page = parseInt(req.param.page) || 1;
  const limit = parseInt(req.param.limit) || 10;
  const sortField = req.query.sortField || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const myLabel = {
    label: `${user.username}'s playlist`,
    url: `/playlist/${user._id}`,
    docs: "playlist",
    limit: "perPage",
    page: "currentPage",
    nextPage: "next",
    prevPage: "prev",
    hasPrevPage: "hasPrev",
    hasNextPage: "hasNext",
    meta: "paginator",
  };
  const option = {
    page,
    limit,
    sortField,
    sortOrder,
    customLabels: myLabel,
  };
  const pipeline = [
    {
      $sort: {
        [sortField]: sortOrder,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
  const aggregate = Playlist.aggregate(pipeline);
  const userPlaylist = await Playlist.aggregatePaginate(aggregate, option);
  return res.status(200).json({
    status: "success",
    data: userPlaylist,
  });
}); // umm okay Idk much about this we ll see this while building frontend : )

export {
  createPlayList,
  addToPlayList,
  removeFromPlayList,
  deletePlayList,
  togglePlayListStatus,
  searchPlaylist,
  getUserPlaylist
};
