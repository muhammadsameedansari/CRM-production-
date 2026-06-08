import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/errorHandler.js';
import { getRevenue, createRevenue, updateRevenue, deleteRevenue, getRevenueSummary } from '../controllers/revenueController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('revenue:read'), getRevenue);
router.get('/summary', authorize('revenue:read'), getRevenueSummary);
router.post('/', authorize('revenue:write'), createRevenue);
router.put('/:id', authorize('revenue:write'), updateRevenue);
router.delete('/:id', authorize('revenue:write'), deleteRevenue);

export default router;
