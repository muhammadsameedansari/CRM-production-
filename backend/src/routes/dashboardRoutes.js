import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/errorHandler.js';
import { getDashboard, getTeamPerformance, globalSearch, getActivities } from '../controllers/dashboardController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('dashboard:read'), getDashboard);
router.get('/team', authorize('team:read'), getTeamPerformance);
router.get('/search', authorize('search:read'), globalSearch);
router.get('/activities', authorize('activities:read'), getActivities);

export default router;
