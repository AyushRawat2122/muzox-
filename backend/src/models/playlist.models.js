import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const playlistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"playlist name is required field"]
    },
    description:{
        type:String,
        required:[true,"Description for this playlist is required field"]
    },
    songs:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Song"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});
playlistSchema.plugin(mongooseAggregatePaginate);
const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;
