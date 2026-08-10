import mongoose from "mongoose";
import Collection from "../models/Collection.js";
import Recipe from "../models/Recipe.js";
import { notify } from "../Services/Notificationservice.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

async function getOrCreateFavorites(userId) {
  let favorites = await Collection.findOne({ owner: userId, isFavorites: true });
  if (!favorites) {
    favorites = await Collection.create({
      owner: userId,
      name: "Favorites",
      isPrivate: true,
      isFavorites: true,
      recipes: [],
    });
  }
  return favorites;
}

async function recalculateSaveCount(recipeId) {
  const owners = await Collection.distinct("owner", { recipes: recipeId });
  await Recipe.findByIdAndUpdate(recipeId, { saveCount: owners.length });
  return owners.length;
}

export const getMyCollections = async (req, res) => {
  try {
    await getOrCreateFavorites(req.user.id);
    const collections = await Collection.find({ owner: req.user.id })
      .populate("recipes", "title image category saveCount")
      .sort({ isFavorites: -1, createdAt: -1 });
    res.json({ collections });
  } catch (error) {
    res.status(500).json({ message: "Failed to load collections" });
  }
};

// GET /api/collections/:id (auth if private)
export const getCollectionById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid collection ID" });

    const collection = await Collection.findById(req.params.id)
      .populate("recipes")
      .populate("owner", "name profilePicture isOfficial");

    if (!collection) return res.status(404).json({ message: "Collection not found" });

    if (collection.isPrivate) {
      if (!req.user || String(collection.owner._id) !== String(req.user.id)) {
        return res.status(403).json({ message: "This collection is private" });
      }
    }

    res.json({ collection });
  } catch (error) {
    res.status(500).json({ message: "Failed to load collection" });
  }
};

// POST /api/collections (auth)
export const createCollection = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Collection name is required" });
    }

    const collection = await Collection.create({
      owner: req.user.id,
      name: name.trim(),
      description: description || "",
      isPrivate: isPrivate !== undefined ? isPrivate : true,
    });

    res.status(201).json({ message: "Collection created", collection });
  } catch (error) {
    res.status(500).json({ message: "Failed to create collection" });
  }
};

// PUT /api/collections/:id (auth, owner) — Favorites cannot be renamed or made public
export const updateCollection = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid collection ID" });

    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: "Collection not found" });
    if (String(collection.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (collection.isFavorites) {
      return res.status(400).json({ message: "The Favorites collection can't be renamed or modified" });
    }

    const { name, description, isPrivate } = req.body;
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Collection name cannot be empty" });
      collection.name = name.trim();
    }
    if (description !== undefined) collection.description = description;
    if (isPrivate !== undefined) collection.isPrivate = isPrivate;

    await collection.save();
    res.json({ message: "Collection updated", collection });
  } catch (error) {
    res.status(500).json({ message: "Failed to update collection" });
  }
};

// DELETE /api/collections/:id (auth, owner) — Favorites cannot be deleted
export const deleteCollection = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid collection ID" });

    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: "Collection not found" });
    if (String(collection.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (collection.isFavorites) {
      return res.status(400).json({ message: "The Favorites collection can't be deleted" });
    }

    const recipeIds = collection.recipes.map((r) => String(r));
    await collection.deleteOne();
    await Promise.all(recipeIds.map((id) => recalculateSaveCount(id)));

    res.json({ message: "Collection deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete collection" });
  }
};


export const toggleRecipeInCollection = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid collection ID" });
    const { recipeId } = req.body;
    if (!isValidId(recipeId)) return res.status(400).json({ message: "Invalid recipe ID" });

    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: "Collection not found" });
    if (String(collection.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const exists = collection.recipes.some((r) => String(r) === String(recipeId));
    if (exists) {
      collection.recipes = collection.recipes.filter((r) => String(r) !== String(recipeId));
    } else {
      collection.recipes.push(recipeId);
    }
    if (!exists) {
  const recipeDoc = await Recipe.findById(recipeId).select("author");
  if (recipeDoc) {
    await notify({ recipient: recipeDoc.author, actor: req.user.id, type: "collectionSave", recipe: recipeId });
  }
}
    await collection.save();
    const saveCount = await recalculateSaveCount(recipeId);

    res.json({ message: exists ? "Removed from collection" : "Added to collection", collection, saveCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to update collection" });
  }
};


export const toggleHeart = async (req, res) => {
  try {
    const recipeId = req.params.id;
    if (!isValidId(recipeId)) return res.status(400).json({ message: "Invalid recipe ID" });

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const favorites = await getOrCreateFavorites(req.user.id);
    const hearted = favorites.recipes.some((r) => String(r) === String(recipeId));

    if (hearted) {
      favorites.recipes = favorites.recipes.filter((r) => String(r) !== String(recipeId));
    } else {
      favorites.recipes.push(recipeId);
    }
    await favorites.save();
    const saveCount = await recalculateSaveCount(recipeId);

    if (!hearted) {
      await notify({ recipient: recipe.author, actor: req.user.id, type: "save", recipe: recipe._id });
    }

    res.json({ hearted: !hearted, saveCount });
  } catch (error) {
    console.error("Toggle heart error:", error.message);
    res.status(500).json({ message: "Failed to update favorites" });
  }
};

// GET /api/recipes/:id/heart-status (auth) — is this recipe in my Favorites?
export const getHeartStatus = async (req, res) => {
  try {
    const favorites = await Collection.findOne({ owner: req.user.id, isFavorites: true });
    const hearted = !!favorites && favorites.recipes.some((r) => String(r) === String(req.params.id));
    res.json({ hearted });
  } catch (error) {
    res.status(500).json({ message: "Failed to check favorite status" });
  }
};

// GET /api/users/:id/collections/public
export const getPublicCollectionsForUser = async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.params.id, isPrivate: false, isFavorites: false })
      .populate("recipes", "title image category saveCount");
    res.json({ collections });
  } catch (error) {
    res.status(500).json({ message: "Failed to load collections" });
  }
};