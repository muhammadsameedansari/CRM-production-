import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/errorHandler.js';
import {
  getClients, getClient, createClient, updateClient, deleteClient,
  addPayment, addProject, exportClients,
} from '../controllers/clientController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('clients:read'), getClients);
router.get('/export', authorize('export:read'), exportClients);
router.get('/:id', authorize('clients:read'), getClient);
router.post('/', authorize('clients:write'), createClient);
router.put('/:id', authorize('clients:write'), updateClient);
router.delete('/:id', authorize('clients:write'), deleteClient);
router.post('/:id/payments', authorize('clients:write'), addPayment);
router.post('/:id/projects', authorize('clients:write'), addProject);

export default router;
