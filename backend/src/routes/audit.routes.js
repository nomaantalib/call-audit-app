import { Router } from "express";
import upload from "../config/multer.config.js";
import { 
  auditCall, 
  getAudits, 
  seedAudits, 
  overrideAudit, 
  chatWithAudit, 
  getRules, 
  updateRules 
} from "../controllers/audit.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All audit routes are protected by auth middleware
router.use(protect);

router.post("/", upload.single("audio"), auditCall);
router.get("/", getAudits);
router.post("/seed", seedAudits);

// --- SaaS Enterprise Core Routes ---
router.post("/:id/override", overrideAudit);
router.post("/:id/chat", chatWithAudit);
router.get("/rules", getRules);
router.post("/rules", updateRules);

export default router;
