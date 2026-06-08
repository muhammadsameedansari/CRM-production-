import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/errorHandler.js';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('tasks:read'), getTasks);
router.get('/:id', authorize('tasks:read'), getTask);
router.post('/', authorize('tasks:write'), createTask);
router.put('/:id', authorize('tasks:write'), updateTask);
router.delete('/:id', authorize('tasks:delete'), deleteTask);

export default router;
