import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, department: user.department?.toString() }, env.accessSecret, { expiresIn: env.accessExpires });
}
export function signRefreshToken(user, tokenId) {
  return jwt.sign({ sub: user._id.toString(), jti: tokenId }, env.refreshSecret, { expiresIn: env.refreshExpires });
}
export function verifyAccessToken(token) { return jwt.verify(token, env.accessSecret); }
export function verifyRefreshToken(token) { return jwt.verify(token, env.refreshSecret); }
export function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
