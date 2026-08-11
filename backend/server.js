import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/Config/db.js";

import authRoutes from "./src/Routes/authRoutes.js";
import otpRoutes from "./src/Routes/otpRoutes.js";
import userRoutes from "./src/Routes/userRoutes.js";
import recipeRoutes, { commentDeleteRouter } from "./src/Routes/recipeRoutes.js";
import collectionRoutes from "./src/Routes/collectionRoutes.js";
import adminRoutes from "./src/Routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Recipia API is running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/comments", commentDeleteRouter);
app.use("/api/collections", collectionRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", requestedUrl: req.originalUrl, method: req.method });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(err.status || 500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Recipia Server Started Successfully");
  console.log(`Server running on port ${PORT}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});


connectDB().then(() => {
  console.log("MongoDB connected");
}).catch(err => {
  console.error("MongoDB connection failed:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});


