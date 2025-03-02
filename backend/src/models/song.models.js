import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Song title is required"],
    },
    artist: {
      type: String,
      required: [true, "Artist name is required"],
      trim: true,
    }, //user will upload a file and this 2 field only rest we will do it
    genre: {
      type: String,
    },
    song: {
      type: {
        public_id: String,
        url: String,
      }, // Cloudinary URL[first we will save it to cloudinary and save it to db].
      required: [true, "Song file URL is required"],
    },
    coverImage: {
      type: {
        public_id: String,
        url: String,
      }, // Cloudinary URL
      default: null,
    },
    duration: {
      type: Number, //will calculate from file size [this also will be from cloudinary]
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

songSchema.plugin(mongooseAggregatePaginate);

const Song = mongoose.model("Song", songSchema);
export default Song;
