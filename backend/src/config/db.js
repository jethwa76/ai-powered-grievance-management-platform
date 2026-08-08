import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import taxonomy from '../../../shared/taxonomy.json' with { type: 'json' };

async function ensureSeeded() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await Promise.all(taxonomy.departments.map((item) => Department.findOneAndUpdate({ code: item.code }, item, { upsert: true, new: true, setDefaultsOnInsert: true })));
      await User.create({ name: 'Platform Administrator', email: 'admin@grievance.local', passwordHash: await bcrypt.hash('ChangeMe!12345', 12), role: 'super_admin' });
      console.log('[DB] Auto-seeded default admin user: admin@grievance.local / ChangeMe!12345');
    }
  } catch (err) {
    console.error('[DB] Auto-seed failed:', err.message);
  }
}

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[DB] Connected to MongoDB at ${env.mongoUri}`);
    await ensureSeeded();
  } catch (err) {
    if (env.nodeEnv === 'development') {
      console.warn(`[DB] Could not connect to external MongoDB (${err.message}). Starting in-memory MongoMemoryServer...`);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`[DB] Connected to In-Memory MongoDB at ${uri}`);
      await ensureSeeded();
    } else {
      throw err;
    }
  }
}


