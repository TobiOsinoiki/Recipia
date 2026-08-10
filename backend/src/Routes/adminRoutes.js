import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { adminMiddleware } from "../middleware/adminAuth.js";
import {
  getAllUsers, makeUserAdmin, removeAdminRole, deleteUser,
  getAllRecipesForAdmin, adminDeleteRecipe, adminDeleteComment,
} from "../Controller/adminController.js";
import { getReports, updateReportStatus } from "../Controller/reportController.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Welcome admin" });
});

router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:userId/make-admin", authMiddleware, adminMiddleware, makeUserAdmin);
router.put("/users/:userId/remove-admin", authMiddleware, adminMiddleware, removeAdminRole);
router.delete("/users/:userId", authMiddleware, adminMiddleware, deleteUser);

router.get("/recipes", authMiddleware, adminMiddleware, getAllRecipesForAdmin);
router.delete("/recipes/:id", authMiddleware, adminMiddleware, adminDeleteRecipe);
router.delete("/comments/:id", authMiddleware, adminMiddleware, adminDeleteComment);

router.get("/reports", authMiddleware, adminMiddleware, getReports);
router.put("/reports/:id", authMiddleware, adminMiddleware, updateReportStatus);

export default router;
