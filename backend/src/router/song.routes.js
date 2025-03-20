import express from "express";

import { authRequired } from "../middlewares/authRequired.middleware.js";

import uploader from "../middlewares/multer.middleware.js";

import {forTheUserHomePage, getLikedSongs, getSuggestionList, likeSong, newlyAddedSectionForHomePage, unlikeSong, uploadSong} from "../controllers/song.controller.js";

const SongRouter = express.Router();

SongRouter.route("/uploadMusic").post(
  uploader.fields([
    { name: "song", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  // authRequired,
  uploadSong
);
SongRouter.get('/suggestionList',getSuggestionList);
SongRouter.post('/like-a-song/:songId',authRequired,likeSong);
SongRouter.get('/getLikedSong',authRequired,getLikedSongs);
SongRouter.delete('/unlike/:songId',authRequired,unlikeSong);
SongRouter.get('/song-for-home',authRequired,forTheUserHomePage);
SongRouter.get('/newlyAddedSong',authRequired,newlyAddedSectionForHomePage);
export default SongRouter;
