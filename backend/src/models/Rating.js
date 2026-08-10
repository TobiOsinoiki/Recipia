import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// A user can only rate a given recipe once (they can update it, not duplicate it)
RatingSchema.index({ recipe: 1, user: 1 }, { unique: true });

const Rating = mongoose.model("Rating", RatingSchema);
export default Rating;
