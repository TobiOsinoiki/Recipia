import User from "../models/User.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    if (!user.roles.includes("admin")) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    req.user.roles = user.roles;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
