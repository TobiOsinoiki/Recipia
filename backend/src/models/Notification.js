import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["follow", "comment", "reply", "save", "report", "newRecipe", "collectionSave", "heart"], required: true },
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ["follow", "comment", "reply", "heart", "collectionSave", "newRecipe"], required: true },
    
  },
  
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;