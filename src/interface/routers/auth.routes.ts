import express from 'express';
import { login, register } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../../validations/auth.validation';

const router = express.Router();

router.post('/register', validate(registerSchema as any), register as any);
router.post('/login', validate(loginSchema), login as any);

export default router;