import { User } from '../models/User.js';
import { AppError } from './error.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function authenticate(req, _res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    if (!token) throw new AppError('Authentication required', 401, 'UNAUTHENTICATED');
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-passwordHash -refreshTokens');
    if (!user || user.status !== 'active') throw new AppError('Account is not active', 401, 'UNAUTHENTICATED');
    req.user = user;
    next();
  } catch (error) { next(error instanceof AppError ? error : new AppError('Invalid or expired token', 401, 'UNAUTHENTICATED')); }
}

export const requireRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
  next();
};
