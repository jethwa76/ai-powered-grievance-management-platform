import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({ recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, type: String, title: String, message: String, complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }, readAt: Date }, { timestamps: true });
notificationSchema.index({ recipient: 1, createdAt: -1 });
export const Notification = mongoose.model('Notification', notificationSchema);
