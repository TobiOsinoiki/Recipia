import mongoose from "mongoose";

const ProfileCommentSchema = new mongoose.Schema(
  {
    profileOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const ProfileComment = mongoose.model("ProfileComment", ProfileCommentSchema);
export default ProfileComment;
