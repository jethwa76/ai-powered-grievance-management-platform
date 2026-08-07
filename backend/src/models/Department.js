import mongoose from 'mongoose';
const departmentSchema = new mongoose.Schema({ code: { type: String, unique: true, index: true }, name: { type: String, required: true }, categories: [String], active: { type: Boolean, default: true } }, { timestamps: true });
export const Department = mongoose.model('Department', departmentSchema);
