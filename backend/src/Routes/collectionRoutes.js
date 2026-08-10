import express from "express";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import {
  getMyCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  toggleRecipeInCollection,
} from "../Controller/collectionController.js";

const router = express.Router();

router.get("/mine", authMiddleware, getMyCollections);
router.get("/:id", optionalAuth, getCollectionById);
router.post("/", authMiddleware, createCollection);
router.put("/:id", authMiddleware, updateCollection);
router.delete("/:id", authMiddleware, deleteCollection);
router.post("/:id/toggle-recipe", authMiddleware, toggleRecipeInCollection);

export default router;