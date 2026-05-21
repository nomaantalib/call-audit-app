
import { Router } from "express";
import upload from "../config/multer.config.js";
import { auditCall, getAudits } from "../controllers/audit.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Apply auth middleware to protect all audit routes
router.use(protect);

// Route: /api/audit
router.post("/", upload.single("audio"), auditCall);
router.get("/", getAudits);

export default router;
