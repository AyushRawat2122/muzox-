import express from "express";

import { authRequired } from "../middlewares/authRequired.middleware.js";

import uploader from "../middlewares/multer.middleware.js";

import {uploadSong} from "../controllers/song.controller.js";

const SongRouter = express.Router();

SongRouter.route("/uploadMusic").post(
  uploader.fields([
    { name: "song", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  // authRequired,
  uploadSong
);
SongRouter.route("/")


SongRouter.route("/:public_id").delete()

export default SongRouter;
