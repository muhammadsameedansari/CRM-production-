import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/errorHandler.js';
import {
  getLeads, getLead, createLead, updateLead, updateLeadStatus,
  deleteLead, getKanbanLeads, importLeads, exportLeads, scrapeLeads,
} from '../controllers/leadController.js';
import { sendLeadEmail, sendLeadWhatsApp } from '../controllers/fileController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('leads:read'), getLeads);
router.get('/kanban', authorize('leads:read'), getKanbanLeads);
router.get('/export', authorize('export:read'), exportLeads);
router.get('/:id', authorize('leads:read'), getLead);
router.post('/', authorize('leads:write'), createLead);
router.post('/import', authorize('import:write'), importLeads);
router.post('/scrape', authorize('leads:write'), scrapeLeads);
router.put('/:id', authorize('leads:write'), updateLead);
router.patch('/:id/status', authorize('leads:write'), updateLeadStatus);
router.delete('/:id', authorize('leads:delete'), deleteLead);
router.post('/:id/email', authorize('leads:write'), sendLeadEmail);
router.post('/:id/whatsapp', authorize('leads:write'), sendLeadWhatsApp);

export default router;
