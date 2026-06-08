import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { authorize } from '../middleware/errorHandler.js';
import { upload, uploadFile, getFiles, deleteFile } from '../controllers/fileController.js';

const router = Router();

router.use(protect);

router.get('/', authorize('files:read'), getFiles);
router.post('/', authorize('files:write'), upload.single('file'), uploadFile);
router.delete('/:id', authorize('files:write'), deleteFile);

export default router;
