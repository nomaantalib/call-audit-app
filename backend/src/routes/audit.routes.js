
import { Router } from "express";
import upload from "../config/multer.config.js";
import { auditCall, getAudits, seedAudits } from "../controllers/audit.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Public route for uploading audio and auditing
router.post("/", upload.single("audio"), auditCall);

// Protected routes for retrieving audits and seeding sandbox
router.use(protect);
router.get("/", getAudits);
router.post("/seed", seedAudits);

export default router;
