import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import { notify } from "../Services/Notificationservice.js";
import User from "../models/User.js";
import {notifyFollowers } from "../Services/Notificationservice.js";
const PUBLIC_TEASER_LIMIT = 6;
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


export const getRecipes = async (req, res) => {
  try {
    const { search = "", category = "", cuisine = "", difficulty = "", tags = "", ingredient = "" } = req.query;
    const sort = req.query.sort || "recent";

    const query = { isDraft: false };
    if (category && category !== "All") query.category = category;
    if (cuisine) query.cuisine = { $regex: cuisine, $options: "i" };
    if (difficulty && difficulty !== "All") query.difficulty = difficulty;
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagList.length) query.tags = { $in: tagList.map((t) => new RegExp(t, "i")) };
    }
    if (ingredient) query.ingredients = { $regex: ingredient, $options: "i" };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ingredients: { $regex: search, $options: "i" } },
      ];
    }

    if (!req.user) {
      const teaser = await Recipe.find({ isDraft: false })
        .populate("author", "name profilePicture isOfficial")
        .sort({ saveCount: -1, createdAt: -1 })
        .limit(PUBLIC_TEASER_LIMIT);
      return res.json({ recipes: teaser, gated: true, limit: PUBLIC_TEASER_LIMIT });
    }

    let sortStage = { createdAt: -1 };
    if (sort === "popular") sortStage = { saveCount: -1, createdAt: -1 };

    const recipes = await Recipe.find(query)
      .populate("author", "name profilePicture isOfficial")
      .sort(sortStage);

    res.json({ recipes, gated: false });
  } catch (error) {
    console.error("Get recipes error:", error.message);
    res.status(500).json({ message: "Failed to load recipes" });
  }
};

// GET /api/recipes/mine?status=draft|published|all (auth)
export const getMyRecipes = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const query = { author: req.user.id };
    if (status === "draft") query.isDraft = true;
    if (status === "published") query.isDraft = false;

    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (error) {
    res.status(500).json({ message: "Failed to load your recipes" });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID" });

    const recipe = await Recipe.findById(req.params.id).populate("author", "name profilePicture bio isOfficial");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.isDraft) {
      const isOwner = req.user && recipe.author && String(recipe.author._id) === String(req.user.id);
      if (!isOwner) return res.status(403).json({ message: "This recipe hasn't been published yet" });
    }

    if (!recipe.isDraft) {
      recipe.viewCount = (recipe.viewCount || 0) + 1;
      await recipe.save();
    }

    res.json({ recipe });
  } catch (error) {
    console.error("Get recipe by id error:", error);
    res.status(500).json({ message: "Failed to load recipe" });
  }
};

// POST /api/recipes (auth)
export const createRecipe = async (req, res) => {
  try {
    const {
      title, description, category, cuisine, tags, image, prepTime, cookTime,
      servings, difficulty, ingredients, instructions, isDraft,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
   
    if (!isDraft && (!ingredients?.length || !instructions?.length)) {
      return res.status(400).json({ message: "Ingredients and instructions are required to publish" });
    }

    const recipe = await Recipe.create({
      title, description, category, cuisine,
      tags: Array.isArray(tags) ? tags : [],
      image, prepTime, cookTime, servings, difficulty,
      ingredients: ingredients || [],
      materials: materials || [],
      instructions: instructions || [],
      author: req.user.id,
      isDraft: !!isDraft,
    });
if (!isDraft) {
  const author = await User.findById(req.user.id).select("followers");
  await notifyFollowers({ actor: req.user.id, followerIds: author.followers, recipe: recipe._id });
}
    const populated = await recipe.populate("author", "name profilePicture isOfficial");
    res.status(201).json({ message: isDraft ? "Draft saved" : "Recipe uploaded", recipe: populated });
  } catch (error) {
    console.error("Create recipe error:", error.message);
    res.status(500).json({ message: "Failed to save recipe" });
  }
};

// PUT /api/recipes/:id (auth, owner only)
export const updateRecipe = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (String(recipe.author) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to edit this recipe" });
    }

    const fields = [
      "title", "description", "category", "cuisine", "tags", "image", "prepTime", "cookTime",
      "servings", "difficulty", "ingredients", "instructions", "isDraft",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) recipe[f] = req.body[f];
    });

    if (recipe.isDraft === false && (!recipe.ingredients?.length || !recipe.instructions?.length)) {
      return res.status(400).json({ message: "Ingredients and instructions are required to publish" });
    }

    await recipe.save();
    res.json({ message: "Recipe updated", recipe });
  } catch (error) {
    res.status(500).json({ message: "Failed to update recipe" });
  }
};

// DELETE /api/recipes/:id (auth, owner or admin)
export const deleteRecipe = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const isOwner = String(recipe.author) === String(req.user.id);
    const isAdmin = req.user.roles?.includes("admin");
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this recipe" });
    }

    await recipe.deleteOne();
    await Comment.deleteMany({ recipe: recipe._id });
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete recipe" });
  }
};


export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.id })
      .populate("user", "name profilePicture isOfficial")
      .sort({ createdAt: 1 });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to load comments" });
  }
};

// POST /api/recipes/:id/comments (auth) { text, parentComment? }
// Recipe owners are allowed to comment/reply on their own recipes.
export const addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    let parent = null;
    if (parentComment) {
      if (!isValidId(parentComment)) return res.status(400).json({ message: "Invalid parent comment" });
      parent = await Comment.findById(parentComment);
      if (!parent || String(parent.recipe) !== String(recipe._id)) {
        return res.status(400).json({ message: "Parent comment not found on this recipe" });
      }
    }

    const comment = await Comment.create({
      recipe: recipe._id,
      user: req.user.id,
      text: text.trim(),
      parentComment: parent ? parent._id : null,
    });
    recipe.commentCount = (recipe.commentCount || 0) + 1;
    await recipe.save();

    if (parent) {
      await notify({ recipient: parent.user, actor: req.user.id, type: "reply", recipe: recipe._id, comment: comment._id });
    } else {
      await notify({ recipient: recipe.author, actor: req.user.id, type: "comment", recipe: recipe._id, comment: comment._id });
    }

    const populated = await comment.populate("user", "name profilePicture isOfficial");
    res.status(201).json({ comment: populated });
  } catch (error) {
    console.error("Add comment error:", error.message);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// DELETE /api/comments/:commentId (auth, comment owner, recipe owner, or admin)
// Deletes the comment and any replies to it.
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const recipe = await Recipe.findById(comment.recipe);
    const isCommentOwner = String(comment.user) === String(req.user.id);
    const isRecipeOwner = recipe && String(recipe.author) === String(req.user.id);
    const isAdmin = req.user.roles?.includes("admin");
    if (!isCommentOwner && !isRecipeOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    const replies = await Comment.find({ parentComment: comment._id });
    const deletedCount = 1 + replies.length;
    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });

    if (recipe) {
      recipe.commentCount = Math.max(0, (recipe.commentCount || 0) - deletedCount);
      await recipe.save();
    }

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};