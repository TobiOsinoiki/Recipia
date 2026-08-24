import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import Comment from "../models/Comment.js";
import Collection from "../models/Collection.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to load users" });
  }
};

export const makeUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.roles.includes("admin")) user.roles.push("admin");
    await user.save();
    res.json({ message: "User promoted to admin", user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ message: "Failed to promote user" });
  }
};

export const removeAdminRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.roles = user.roles.filter((r) => r !== "admin");
    await user.save();
    res.json({ message: "Admin role removed", user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove admin role" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    await Recipe.deleteMany({ author: user._id });
    await Comment.deleteMany({ user: user._id });
    await Collection.deleteMany({ owner: user._id });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// GET /api/admin/recipes?status=draft|published|all — moderation list, includes author info
export const getAllRecipesForAdmin = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const query = {};
    if (status === "draft") query.isDraft = true;
    if (status === "published") query.isDraft = false;

    const recipes = await Recipe.find(query)
      .populate("author", "name email isOfficial")
      .sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (error) {
    res.status(500).json({ message: "Failed to load recipes" });
  }
};

// DELETE /api/admin/recipes/:id — moderate/remove any recipe
export const adminDeleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    await recipe.deleteOne();
    await Comment.deleteMany({ recipe: recipe._id });
    res.json({ message: "Recipe removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove recipe" });
  }
};

// DELETE /api/admin/comments/:id — moderate/remove any comment (and its replies)
export const adminDeleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const replies = await Comment.find({ parentComment: comment._id });
    const deletedCount = 1 + replies.length;
    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });
    await Recipe.findByIdAndUpdate(comment.recipe, { $inc: { commentCount: -deletedCount } });

    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove comment" });
  }
};

export const suspendUser = async (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: "You cannot suspend your own account" });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.suspended = true;
    await user.save();
    res.json({ message: "User suspended", user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ message: "Failed to suspend user" });
  }
};

export const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.suspended = false;
    await user.save();
    res.json({ message: "User unsuspended", user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ message: "Failed to unsuspend user" });
  }
};