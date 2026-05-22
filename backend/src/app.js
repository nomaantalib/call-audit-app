import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import auditRoutes from "./routes/audit.routes.js";
import authRoutes from "./routes/auth.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../../frontend/dist");

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors()); // Allow all cors for now or configure as needed
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/audit", auditRoutes);

import fs from "fs";

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

app.get("/api/debug-files", (req, res) => {
  try {
    const assets = fs.existsSync(path.join(frontendPath, "assets"))
      ? fs.readdirSync(path.join(frontendPath, "assets"))
      : [];
    const indexContent = fs.existsSync(path.join(frontendPath, "index.html"))
      ? fs.readFileSync(path.join(frontendPath, "index.html"), "utf8")
      : "Not found";
    res.json({
      frontendPath,
      exists: fs.existsSync(frontendPath),
      assets,
      indexContent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serving Frontend static files
app.use(express.static(frontendPath));

// Fallback to serve index.html for any other routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Global error handling middleware (handles Multer LIMIT_FILE_SIZE and other errors)
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "Audio file size exceeds the maximum limit of 1 MB."
    });
  }
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "An unexpected server error occurred."
  });
});

export default app;
