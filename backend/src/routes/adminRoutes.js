import { Router } from "express";
import {
	approveEntry,
	queryFacultyKnowledge,
	getApprovalHistory,
	getAuditTimeline,
	getFacultyDirectory,
	getPendingEntries,
	rejectEntry,
	removeEntryByAdmin,
	removeFacultyByAdmin,
} from "../controllers/adminController.js";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.use(authRequired, requireRole(["admin"]));

router.get("/pending", getPendingEntries);
router.get("/audit", getAuditTimeline);
router.get("/history", getApprovalHistory);
router.get("/faculty", getFacultyDirectory);
router.get("/query", queryFacultyKnowledge);
router.put("/approve/:table/:id", approveEntry);
router.delete("/reject/:table/:id", rejectEntry);
router.delete("/remove/:table/:id", removeEntryByAdmin);
router.delete("/faculty/:id", removeFacultyByAdmin);

export default router;
