import mongoose from 'mongoose';
const reviewQueueSchema = new mongoose.Schema({ complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', unique: true }, reason: String, status: { type: String, enum: ['pending','approved','overridden'], default: 'pending', index: true }, reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, decision: mongoose.Schema.Types.Mixed, decidedAt: Date }, { timestamps: true });
export const ReviewQueue = mongoose.model('ReviewQueue', reviewQueueSchema);
