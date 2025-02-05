import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../core/repositories/UserRepository';
import { signJwt } from '../infrastructure/lib/auth'
import { config } from 'dotenv';
config();

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


export const register = async (req: Request, res: Response) => {
  const { email, password ,  passwordHash , firstName , lastName , phone , UserRole } = req.body;

  const user = await userRepository.create({
      email: email!,
      passwordHash: await bcrypt.hash(password , process.env.PASSWORD_HASH_SALT!)   , // need to hash this
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      role: UserRole 
  });
  if (!user) {
    return res.status(401).json({ error: 'Signup Failed' });
  }

  res.json({ user });
};