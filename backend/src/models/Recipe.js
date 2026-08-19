import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"],
      default: "Dinner",
    },
    cuisine: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },

    image: { type: String, default: "" }, 
    prepTime: { type: String, default: "" },
    cookTime: { type: String, default: "" },
    servings: { type: Number, default: 2, min: 1 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },

    ingredients: { type: [String], default: [] },
    materials: { type: [String], default: [] },
    instructions: { type: [String], default: [] },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    isDraft: { type: Boolean, default: false },

    commentCount: { type: Number, default: 0 },
    
    saveCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RecipeSchema.index({ title: "text", description: "text" });

const Recipe = mongoose.model("Recipe", RecipeSchema);
export default Recipe;