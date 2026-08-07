import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({ hash: String, expiresAt: Date }, { _id: false });
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  phone: { type: String, trim: true }, passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['citizen','department_officer','department_admin','super_admin','ai_review_officer'], default: 'citizen', index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  preferredLanguage: { type: String, default: 'en' }, status: { type: String, enum: ['active','suspended'], default: 'active' },
  refreshTokens: { type: [refreshTokenSchema], select: false },
  resetTokenHash: { type: String, select: false }, resetTokenExpiresAt: { type: Date, select: false }
}, { timestamps: true });
export const User = mongoose.model('User', userSchema);
