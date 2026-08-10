import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: "", maxlength: 500, trim: true },
    profilePicture: { type: String, default: null },
    roles: { type: [String], default: ["user"] }, 

   
    isOfficial: { type: Boolean, default: false },
    
notificationSettings: {
  follow: { type: Boolean, default: true },
  comment: { type: Boolean, default: true },
  reply: { type: Boolean, default: true },
  heart: { type: Boolean, default: true },
  collectionSave: { type: Boolean, default: true },
  newRecipe: { type: Boolean, default: true },
},
    
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    uuid: { type: String, default: uuidv4, unique: true },
    isVerified: { type: Boolean, default: false },
    verificationMethod: { type: String, enum: ["email"], default: "email" },
  },
  { timestamps: true }
);

UserSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", UserSchema);
export default User;