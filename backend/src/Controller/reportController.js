import mongoose from "mongoose";
import Report from "../models/Report.js";
import Recipe from "../models/Recipe.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/recipes/:id/report (auth)
export const createReport = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID" });
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ message: "Please describe the issue" });

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const report = await Report.create({ recipe: recipe._id, reporter: req.user.id, reason: reason.trim() });
    res.status(201).json({ message: "Report submitted", report });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit report" });
  }
};

// GET /api/admin/reports?status=open|resolved|dismissed|all (admin)
export const getReports = async (req, res) => {
  try {
    const { status = "open" } = req.query;
    const query = status === "all" ? {} : { status };
    const reports = await Report.find(query)
      .populate("recipe", "title isDraft")
      .populate("reporter", "name email")
      .sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Failed to load reports" });
  }
};

// PUT /api/admin/reports/:id (admin) { status }
export const updateReportStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid report ID" });
    const { status } = req.body;
    if (!["resolved", "dismissed", "open"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: "Failed to update report" });
  }
};