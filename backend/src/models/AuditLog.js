import mongoose from 'mongoose';
const auditLogSchema = new mongoose.Schema({ actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, action: String, targetType: String, targetId: String, metadata: mongoose.Schema.Types.Mixed, ipAddress: String, userAgent: String }, { timestamps: true });
auditLogSchema.index({ createdAt: -1, action: 1 });
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
