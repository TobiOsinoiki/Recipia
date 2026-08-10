import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";

// PUT /api/me/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: "Profile updated", user: user.toPublicJSON() });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// GET /api/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ message: "Failed to load user" });
  }
};

// GET /api/users/:id/public
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const uploadedRecipes = await Recipe.find({ author: user._id, isDraft: false })
      .populate("author", "name profilePicture isOfficial")
      .sort({ createdAt: -1 });

    const mostSavedRecipes = [...uploadedRecipes]
      .filter((r) => r.saveCount > 0)
      .sort((a, b) => b.saveCount - a.saveCount)
      .slice(0, 5);

    let isFollowing = false;
    if (req.user) {
      const me = await User.findById(req.user.id).select("following");
      isFollowing = me.following.some((f) => String(f) === String(user._id));
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isOfficial: user.isOfficial,
        createdAt: user.createdAt,
        followerCount: user.followers.length,
        followingCount: user.following.length,
      },
      uploadedRecipes,
      mostSavedRecipes,
      isFollowing,
    });
  } catch (error) {
    console.error("Public profile error:", error.message);
    res.status(500).json({ message: "Failed to load profile" });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;
    if (!q.trim()) return res.json({ users: [] });

    const users = await User.find({
      name: { $regex: q.trim(), $options: "i" },
      _id: { $ne: req.user?.id },
    })
      .select("name profilePicture bio isOfficial")
      .limit(20);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to search users" });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.notificationSettings = { ...user.notificationSettings.toObject(), ...req.body };
    await user.save();
    res.json({ notificationSettings: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification settings" });
  }
};