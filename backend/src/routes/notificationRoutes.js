import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/errorHandler.js';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('notifications:read'), getNotifications);
router.patch('/read-all', authorize('notifications:write'), markAllAsRead);
router.patch('/:id/read', authorize('notifications:write'), markAsRead);
router.delete('/:id', authorize('notifications:write'), deleteNotification);

export default router;
