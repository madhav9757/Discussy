import express from 'express';
import { getNotifications, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);

export default router;
