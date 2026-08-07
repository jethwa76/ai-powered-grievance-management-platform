import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { AppError } from '../middleware/error.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';

const router = Router();
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, preferredLanguage: user.preferredLanguage });
router.post('/register', asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  if (await User.exists({ email: input.email })) throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  const user = await User.create({ ...input, passwordHash: await bcrypt.hash(input.password, 12) });
  const accessToken = signAccessToken(user); const refreshToken = signRefreshToken(user, crypto.randomUUID());
  await User.updateOne({ _id: user._id }, { $push: { refreshTokens: { hash: hashToken(refreshToken), expiresAt: new Date(Date.now() + 7 * 86400000) } } });
  res.status(201).json({ success: true, data: { user: publicUser(user), accessToken, refreshToken } });
}));
router.post('/login', asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body); const user = await User.findOne({ email: input.email }).select('+passwordHash +refreshTokens');
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  const refreshToken = signRefreshToken(user, crypto.randomUUID());
  user.refreshTokens = [...(user.refreshTokens || []).filter((token) => token.expiresAt > new Date()), { hash: hashToken(refreshToken), expiresAt: new Date(Date.now() + 7 * 86400000) }];
  await user.save(); res.json({ success: true, data: { user: publicUser(user), accessToken: signAccessToken(user), refreshToken } });
}));
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body; if (!refreshToken) throw new AppError('Refresh token required', 400, 'VALIDATION_ERROR');
  const payload = verifyRefreshToken(refreshToken); const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || !user.refreshTokens.some((token) => token.hash === hashToken(refreshToken))) throw new AppError('Refresh token revoked', 401, 'UNAUTHENTICATED');
  const nextRefresh = signRefreshToken(user, crypto.randomUUID()); user.refreshTokens = user.refreshTokens.filter((token) => token.hash !== hashToken(refreshToken)); user.refreshTokens.push({ hash: hashToken(nextRefresh), expiresAt: new Date(Date.now() + 7 * 86400000) }); await user.save();
  res.json({ success: true, data: { accessToken: signAccessToken(user), refreshToken: nextRefresh } });
}));
router.post('/logout', asyncHandler(async (req, res) => { const { refreshToken } = req.body; if (refreshToken) { try { const payload = verifyRefreshToken(refreshToken); await User.updateOne({ _id: payload.sub }, { $pull: { refreshTokens: { hash: hashToken(refreshToken) } } }); } catch {} } res.json({ success: true, data: { message: 'Logged out' } }); }));
router.post('/forgot-password', asyncHandler(async (req, res) => { const email = String(req.body.email || '').toLowerCase(); const user = await User.findOne({ email }).select('+resetTokenHash +resetTokenExpiresAt'); const response = { success:true, data:{ message:'If an account exists, password reset instructions have been sent.' } }; if (!user) return res.json(response); const token = crypto.randomBytes(32).toString('hex'); user.resetTokenHash = hashToken(token); user.resetTokenExpiresAt = new Date(Date.now()+30*60*1000); await user.save(); if (process.env.NODE_ENV !== 'production') response.data.resetToken = token; console.info(`Password reset requested for ${user.email}`); res.json(response); }));
router.post('/reset-password', asyncHandler(async (req, res) => { const { token, password } = req.body; if (!token || typeof password !== 'string' || password.length < 10) throw new AppError('A valid token and password of at least 10 characters are required',400,'VALIDATION_ERROR'); const user = await User.findOne({ resetTokenHash:hashToken(token), resetTokenExpiresAt:{$gt:new Date()} }).select('+resetTokenHash +resetTokenExpiresAt +passwordHash'); if (!user) throw new AppError('Reset token is invalid or expired',400,'INVALID_RESET_TOKEN'); user.passwordHash = await bcrypt.hash(password,12); user.resetTokenHash = undefined; user.resetTokenExpiresAt = undefined; user.refreshTokens = []; await user.save(); res.json({success:true,data:{message:'Password reset successfully'}}); }));
export default router;
