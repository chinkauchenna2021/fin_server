import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Sign a JWT token with the provided user ID.
 * @param userId - The user ID to include in the token payload.
 * @returns The signed JWT token.
 */
export const signJwt = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

/**
 * Verify a JWT token and extract the user ID from the payload.
 * @param token - The JWT token to verify.
 * @returns The user ID if the token is valid, otherwise null.
 */
export const verifyJwt = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

/**
 * Middleware to decode and attach the user ID to the request object.
 * @param token - The JWT token to decode.
 * @returns The decoded user ID or null if the token is invalid.
 */
export const decodeJwt = (token: string): string | null => {
  try {
    const decoded = jwt.decode(token) as { userId: string };
    return decoded?.userId || null;
  } catch (error) {
    console.error('JWT decoding failed:', error);
    return null;
  }
};