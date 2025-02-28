import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
  {
    song: {
      type: mongoose.Types.ObjectId,
      ref: "Song",
    },
    likedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

likeSchema.plugin(mongooseAggregatePaginate);

const Like = mongoose.model("Like", likeSchema);

export default Like;
