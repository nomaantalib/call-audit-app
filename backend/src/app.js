import express from "express";
import cors from "cors";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

app.use(cors()); // Allow all cors for now or configure as needed
app.use(express.json());

app.use("/api/audit", auditRoutes);

export default app;
