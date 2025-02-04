import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../infrastructure/lib/auth';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const userId = verifyJwt(token);
  if (!userId) return res.status(401).json({ error: 'Invalid token' });

  req.userId = userId;
  next();
};