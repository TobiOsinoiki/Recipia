import mongoose from "mongoose";
import User from "../models/User.js";
import { notify } from "../Services/notificationService.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/users/:id/follow (auth) — toggles follow/unfollow
export const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!isValidId(targetId)) return res.status(400).json({ message: "Invalid user ID" });
    if (String(targetId) === String(req.user.id)) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const [me, target] = await Promise.all([User.findById(req.user.id), User.findById(targetId)]);
    if (!target) return res.status(404).json({ message: "User not found" });

    const alreadyFollowing = me.following.some((f) => String(f) === String(targetId));

    if (alreadyFollowing) {
      me.following = me.following.filter((f) => String(f) !== String(targetId));
      target.followers = target.followers.filter((f) => String(f) !== String(req.user.id));
    } else {
      me.following.push(targetId);
      target.followers.push(req.user.id);
    }

    await Promise.all([me.save(), target.save()]);

    if (!alreadyFollowing) {
      await notify({ recipient: target._id, actor: req.user.id, type: "follow" });
    }

    res.json({
      following: !alreadyFollowing,
      followerCount: target.followers.length,
    });
  } catch (error) {
    console.error("Toggle follow error:", error.message);
    res.status(500).json({ message: "Failed to update follow status" });
  }
};

// GET /api/users/:id/followers
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "name profilePicture isOfficial");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ message: "Failed to load followers" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "name profilePicture isOfficial");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ following: user.following });
  } catch (error) {
    res.status(500).json({ message: "Failed to load following" });
  }
};