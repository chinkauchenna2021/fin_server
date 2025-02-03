import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../core/repositories/UserRepository';
import { signJwt } from '../infrastructure/lib/auth'

const userRepository = new UserRepository();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userRepository.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signJwt(user.id);
  res.json({ token });
};