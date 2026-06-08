import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/protect.js';
import { authorize, validate } from '../middleware/errorHandler.js';
import { login, register, getMe, getUsers, updateUser, deleteUser } from '../controllers/authController.js';

const router = Router();

router.post(
  '/login',
  validate([body('email').isEmail(), body('password').notEmpty()]),
  login
);

router.post(
  '/register',
  validate([
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ]),
  register
);

router.get('/me', protect, getMe);
router.get('/users', protect, authorize('team:read'), getUsers);
router.put('/users/:id', protect, authorize('users:write'), updateUser);
router.delete('/users/:id', protect, authorize('users:write'), deleteUser);

export default router;
