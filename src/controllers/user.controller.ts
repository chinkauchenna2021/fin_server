import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../core/repositories/UserRepository';

const userRepository = new UserRepository();

export const getUsers = async (req: Request, res: Response) => {
  const users = await userRepository.findAll();
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    email,
    passwordHash: hashedPassword,
    firstName,
    lastName,
  });

  res.json(user);
};