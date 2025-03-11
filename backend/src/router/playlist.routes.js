import express from "express"
import { addToPlayList, createPlayList, deletePlayList, removeFromPlayList, searchPlaylist } from "../controllers/playlist.controller.js";
import {authRequired }from "../middlewares/authRequired.middleware.js";
import uploader from "../middlewares/multer.middleware.js";
const PlayListRouter=express.Router();
PlayListRouter.post('/create-playlist',  uploader.fields([{ name: "playListCover", maxCount: 1 }]),authRequired,createPlayList);
PlayListRouter.post('/add-to-playlist/:playListID/:songId',authRequired,addToPlayList);
PlayListRouter.post('/remove-from-playlist/:playListID/:songId',authRequired,removeFromPlayList);
PlayListRouter.post('/delete-playlist/:playListID',authRequired,deletePlayList);
PlayListRouter.post('/search-playlist',searchPlaylist);
export default PlayListRouter;