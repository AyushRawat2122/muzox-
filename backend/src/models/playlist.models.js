import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Playlist name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Playlist description is required"],
      trim: true,
    },
    playListCover: {
      type: {
        public_id: String,
        url: String,
      },
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    publishStatus: {
      type: Boolean,
      required: true,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

playlistSchema.plugin(mongooseAggregatePaginate);

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;
