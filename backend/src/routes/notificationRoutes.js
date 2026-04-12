import { Router } from "express";
import { listMyNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notificationController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.use(authRequired);
router.get("/", listMyNotifications);
router.put("/read-all", markAllNotificationsRead);
router.put("/:id/read", markNotificationRead);

export default router;
