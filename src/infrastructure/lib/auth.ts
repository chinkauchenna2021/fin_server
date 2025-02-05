import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const signJwt = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyJwt = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export const decodeJwt = (token: string): string | null => {
  try {
    const decoded = jwt.decode(token) as { userId: string };
    return decoded?.userId || null;
  } catch (error) {
    console.error('JWT decoding failed:', error);
    return null;
  }
};