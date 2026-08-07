import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import complaintRoutes from './routes/complaints.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import reviewQueueRoutes from './routes/reviewQueue.js';
import uploadRoutes from './routes/uploads.js';
import { errorHandler, notFound } from './middleware/error.js';
import { authenticate } from './middleware/auth.js';

export function createApp() {
  const app = express();
  app.use(helmet()); app.use(cors({ origin: env.clientUrl, credentials: true })); app.use(compression()); app.use(cookieParser()); app.use(express.json({ limit:'1mb' })); app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use('/api/v1/auth', rateLimit({ windowMs:15*60*1000, limit:100, standardHeaders:true, legacyHeaders:false }), authRoutes);
  app.use('/api/v1', rateLimit({ windowMs:60*1000, limit:300, standardHeaders:true, legacyHeaders:false }));
  app.get('/health', (_req,res) => res.json({status:'ok',service:'grievance-api',timestamp:new Date().toISOString()}));
  app.use('/uploads', authenticate, express.static('uploads', { dotfiles:'deny', index:false }));
  app.use('/api/v1/users', userRoutes); app.use('/api/v1/complaints', complaintRoutes); app.use('/api/v1/notifications', notificationRoutes); app.use('/api/v1/admin', adminRoutes); app.use('/api/v1/review-queue', reviewQueueRoutes); app.use('/api/v1/uploads', uploadRoutes);
  app.use(notFound); app.use(errorHandler); return app;
}
