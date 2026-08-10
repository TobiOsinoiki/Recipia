import express from "express";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import {
  getRecipes,
  getMyRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getComments,
  addComment,
  deleteComment,
} from "../Controller/recipeController.js";
import { toggleHeart, getHeartStatus } from "../Controller/collectionController.js";
import { createReport } from "../Controller/reportController.js";

const router = express.Router();

router.get("/", optionalAuth, getRecipes);
router.get("/mine", authMiddleware, getMyRecipes);
router.get("/:id", optionalAuth, getRecipeById);
router.post("/", authMiddleware, createRecipe);
router.put("/:id", authMiddleware, updateRecipe);
router.delete("/:id", authMiddleware, deleteRecipe);

router.post("/:id/heart", authMiddleware, toggleHeart);
router.get("/:id/heart-status", authMiddleware, getHeartStatus);

router.get("/:id/comments", getComments);
router.post("/:id/comments", authMiddleware, addComment);

router.post("/:id/report", authMiddleware, createReport);

export default router;

export const commentDeleteRouter = express.Router();
commentDeleteRouter.delete("/:commentId", authMiddleware, deleteComment);