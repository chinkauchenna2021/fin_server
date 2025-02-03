import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateUserSchema } from '../validations/user.validation';

const router = express.Router();

router.use(authMiddleware);

router.get('/', adminMiddleware, getUsers);
router.get('/:id', getUserById);
router.put('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', adminMiddleware, deleteUser);

export default router;