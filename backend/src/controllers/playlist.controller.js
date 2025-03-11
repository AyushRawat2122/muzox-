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
    next(new ApiError(400, "name and description are required"));
  } // title and description about playlist required

  const playListCoverLocal = req.file?.playListCover?.[0]?.url;
  let playListCover = undefined;

  if (playListCoverLocal) {
    playListCover = await uploadOnCloudinary(playListCoverLocal);
    if (!playListCover) {
      next( new ApiError(500, "something went wrong while uploading coverImg"));
    }
  } //we ll upload only if user wants to upload file if he doesnt it's okay

  await Playlist.create({
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
    .json(new ApiResponse(200, "", "playlist created successfully"));
}); //ok

//delete PlayList

const deletePlayList = asyncHandler(async (req, res , next) => {
  const { playListID } = req.params;
  const { _id } = req.user;


  if (playListID === "") {
    next( new ApiError(400, "ID is not found try again later"));
  }

  const playList = await Playlist.findById(playListID);


  if (!playList) {
    next( new ApiError(404, "Playlist not found"));
  }

  if (_id?.toString() !== playList?.owner?.toString()) {
    next( new ApiError(400, "you are not authorized to delete this playlist"));
  }

  const picToDelete = playList?.playListCover?.public_id;

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
  console.log("hi");
  const { playListID, songId } = req.params;
  console.log(typeof playListID, songId);
  const { _id } = req.user;

  const playlist = await Playlist.findOneAndUpdate(
    {
      $and: [
        { _id: new mongoose.Types.ObjectId(playListID) },
        { owner: new mongoose.Types.ObjectId(_id) },
      ],
    }, //samjha nai say propely
    {
      $addToSet: {
        songs: new mongoose.Types.ObjectId(songId),
      },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    next( new ApiError(404, "Internal Server error "));
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, playlist, "Song added to playlist successfully")
    );
});

//remove from PlayList
const removeFromPlayList = asyncHandler(async (req, res , next) => {
  const { playListID, songId } = req.params;
  const { _id } = req.user;
  const playlist = await Playlist.findById(playListID);
  if (!playlist) {
    next( new ApiError(404, "Playlist or Song not found"));
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
const togglePlayListStatus = asyncHandler(async (req, res) => {
  const { playListID } = req.params;
  if (!playListID) {
    next( new ApiError(400, "Playlist id is required to toggle publish status"));
  }
  await Playlist.findByIdAndUpdate(
    playListID,
    [{ $set: { publishStatus: { $not: "$publishStatus" } } }],
    { new: true }
  );
  return new ApiResponse(200, "", "Publish Status toggled successfully");
});

const searchPlaylist = asyncHandler(async (req, res) => {
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
const addThisPlaylist = asyncHandler(async (req, res) => {

  const { playListId } = req.params;

  if (!playListId) {
    next( new ApiError(400, "Playlist id is required to add to User playlists"));
  }

  const { _id } = req.user;
  const userUpdatedPlaylist = await User.findByIdAndUpdate(
    _id,
    { $addToSet: { playlists: new mongoose.Types.ObjectId(playListId)} }, 
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      userUpdatedPlaylist,
      "Playlist added to your collection successfully"
    )
  );
});
const getUserPlaylists=asyncHandler(async(req,res)=>{
  
  const {_id}=req.user;

  const populatedPlaylists=await User.findById(_id).populate("playlists").select("playlists");

  const userCreatedPlaylist=await Playlist.find(
    { owner: new mongoose.Types.ObjectId(_id)},
  )
  
  const data=[...populatedPlaylists,...userCreatedPlaylist];
  
  return res.status(200).json(new ApiResponse(200, data, "User playlists"));

})

export {
  createPlayList,
  addToPlayList,
  removeFromPlayList,
  deletePlayList,
  togglePlayListStatus,
  searchPlaylist,
};
