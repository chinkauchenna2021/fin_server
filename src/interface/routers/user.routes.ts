import express from 'express';
import {
     UserController
} from '../../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { updateUserSchema } from '../../validations/user.validation';

const router = express.Router();

router.use(authMiddleware as any);

router.get('/', adminMiddleware, UserController.getUsers as any);
router.get('/:id',UserController.getUserById as any);
router.put('/:id', validate(updateUserSchema), UserController.updateUser as any);
router.delete('/:id', adminMiddleware, UserController.deleteUser as any);

export default router;