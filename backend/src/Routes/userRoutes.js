import express from "express";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import { updateProfile, getMe, getPublicProfile, searchUsers } from "../Controller/userController.js";
import { getPublicCollectionsForUser } from "../Controller/collectionController.js";
import { toggleFollow, getFollowers, getFollowing } from "../Controller/FollowController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me/profile", authMiddleware, updateProfile);

router.get("/users/search", authMiddleware, searchUsers);
router.get("/users/:id/public", optionalAuth, getPublicProfile);
router.get("/users/:id/collections/public", getPublicCollectionsForUser);

router.post("/users/:id/follow", authMiddleware, toggleFollow);
router.get("/users/:id/followers", getFollowers);
router.get("/users/:id/following", getFollowing);

export default router;