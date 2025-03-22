import express from "express";
import {
  addToPlayList,
  createPlayList,
  deletePlayList,
  addThisPlaylist,
  removeFromPlayList,
  searchPlaylist,
  getPlaylistSongs,
  removeFromLibrary,
  forTheHomePage,
} from "../controllers/playlist.controller.js";
import { authRequired } from "../middlewares/authRequired.middleware.js";
import uploader from "../middlewares/multer.middleware.js";
const PlayListRouter = express.Router();
PlayListRouter.post(
  "/create-playlist",
  uploader.fields([{ name: "playListCover", maxCount: 1 }]),
  authRequired,
  createPlayList
);
PlayListRouter.post(
  "/add-to-playlist/:playListID/:songId",
  authRequired,
  addToPlayList
);
PlayListRouter.patch(
  "/remove-from-playlist/:playListID/:songId",
  authRequired,
  removeFromPlayList
);
PlayListRouter.post(
  "/delete-playlist/:playListID",
  authRequired,
  deletePlayList
);
PlayListRouter.get("/search-playlist", searchPlaylist);
PlayListRouter.get("/get-playlist-songs/:playListID", authRequired, getPlaylistSongs);
PlayListRouter.patch("/save-to-library/:playListId", authRequired, addThisPlaylist);
PlayListRouter.patch("/remove-from-library/:playListId", authRequired, removeFromLibrary);
PlayListRouter.get('/home-page-playlist',authRequired,forTheHomePage);
export default PlayListRouter;
