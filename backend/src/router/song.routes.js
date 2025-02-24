import { Router } from "express";
import uploader from "../middlewares/multer.middleware";
import { uploadSong } from "../controllers/song.controller";
const SongRouter = Router();

SongRouter.route("/uploadMusic").post(
  uploader.fields([
    { name: "song", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  uploadSong
);

SongRouter.route("/:public_id").delete()
