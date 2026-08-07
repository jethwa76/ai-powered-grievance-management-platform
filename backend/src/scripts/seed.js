import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import taxonomy from '../../../shared/taxonomy.json' with { type: 'json' };
await connectDatabase();
const departments = await Promise.all(taxonomy.departments.map((item) => Department.findOneAndUpdate({code:item.code}, item, {upsert:true,new:true,setDefaultsOnInsert:true})));
const admin = await User.findOne({email:'admin@grievance.local'}); if (!admin) await User.create({name:'Platform Administrator',email:'admin@grievance.local',passwordHash:await bcrypt.hash('ChangeMe!12345',12),role:'super_admin'});
console.log(`Seeded ${departments.length} departments. Admin: admin@grievance.local / ChangeMe!12345`); process.exit(0);
