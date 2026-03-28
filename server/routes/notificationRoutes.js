import express from 'express';
import { 
  getNotifications, 
  markAllRead, 
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markNotificationAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/', protect, deleteAllNotifications);

export default router;