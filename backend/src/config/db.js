import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import taxonomy from '../../../shared/taxonomy.json' with { type: 'json' };

async function ensureSeeded() {
  try {
    await Promise.all(
      taxonomy.departments.map((item) =>
        Department.findOneAndUpdate({ code: item.code }, item, { upsert: true, new: true, setDefaultsOnInsert: true })
      )
    );
    const passHash = await bcrypt.hash('ChangeMe!12345', 12);
    
    if (!(await User.exists({ email: 'admin@grievance.local' }))) {
      await User.create({ name: 'Platform Administrator', email: 'admin@grievance.local', passwordHash: passHash, role: 'super_admin' });
    }
    if (!(await User.exists({ email: 'dept.admin@grievance.local' }))) {
      await User.create({ name: 'Meta / Dept Administrator', email: 'dept.admin@grievance.local', passwordHash: passHash, role: 'department_admin' });
    }
    if (!(await User.exists({ email: 'citizen@grievance.local' }))) {
      await User.create({ name: 'Citizen User', email: 'citizen@grievance.local', passwordHash: passHash, role: 'citizen' });
    }
    console.log('[DB] Auto-seeded demo users: admin@grievance.local, dept.admin@grievance.local, citizen@grievance.local (Password: ChangeMe!12345)');
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


