import mongoose from 'mongoose';
const timelineSchema = new mongoose.Schema({ complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', index: true }, actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, event: String, status: String, comment: String, metadata: mongoose.Schema.Types.Mixed }, { timestamps: true });
export const Timeline = mongoose.model('ComplaintTimeline', timelineSchema);
