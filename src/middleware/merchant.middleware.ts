import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../core/repositories/UserRepository';

const userRepository = new UserRepository();

export const merchantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId!;
  const user = await userRepository.findById(userId);

  if (!user || user.role !== 'MERCHANT') {
    return res.status(403).json({ error: 'Access denied. Merchant role required.' });
  }

  next();
};