import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    isPrivate: { type: Boolean, default: true },
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
   
    isFavorites: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One Favorites collection per user
CollectionSchema.index({ owner: 1, isFavorites: 1 }, { unique: false });

const Collection = mongoose.model("Collection", CollectionSchema);
export default Collection;