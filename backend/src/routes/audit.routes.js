
import { Router } from "express";
import upload from "../config/multer.config.js";
import { auditCall, getAudits } from "../controllers/audit.controller.js";

const router = Router();

// Route: /api/audit
router.post("/", upload.single("audio"), auditCall);
router.get("/", getAudits);

export default router;
