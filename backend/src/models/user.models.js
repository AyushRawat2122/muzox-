import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, "Username is a required field"],
      lowercase: true,
      trim: true,
      minlength: [6, "Username Must Contain at least 6 letters"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
      required: [true, "Email is a required field"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      required: [true, "Password is a required field"],
      minlength: [8, "Username Must Contain at least 6 letters"],
    },
    playlist:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Playlist'
        }
    ],
    avatar: {
      type: {
        public_id: String,
        url: String,
      },
    },
    coverImage: {
      type: {
        public_id: String,
        url: String,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPremiumUser: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: Number,
      default: null,
    },
    verifyTokenExpiry: {
      type: Date,
      default: null,
    },
    passwordToken: {
      type: Number,
      default: null,
    },
    passwordTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
userSchema.plugin(mongooseAggregatePaginate);
const User = mongoose.model("User", userSchema);
export default User;
