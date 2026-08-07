import 'dotenv/config';

const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
if (process.env.NODE_ENV === 'production') {
  for (const key of required) if (!process.env[key]) throw new Error(`${key} is required`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/grievance_platform',
  accessSecret: process.env.JWT_ACCESS_SECRET || 'local-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'local-refresh-secret',
  accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
