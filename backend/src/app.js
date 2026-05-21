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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
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

export default app;
