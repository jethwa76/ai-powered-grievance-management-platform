import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({ url: String, publicId: String, filename: String, mimeType: String, size: Number, checksum: String }, { _id: true });
const complaintSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true, index: true }, citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true }, description: { type: String, required: true },
  category: { type: String, index: true }, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  location: { address: String, city: String, coordinates: { lat: Number, lng: Number } }, complaintDate: Date, language: String,
  urgency: { type: String, enum: ['low','medium','high','critical'], default: 'medium', index: true }, priority: { type: String, enum: ['low','medium','high','critical'], default: 'medium', index: true },
  status: { type: String, enum: ['submitted','under_review','assigned','in_progress','awaiting_citizen','resolved','closed','reopened'], default: 'submitted', index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, attachments: [attachmentSchema], aiReviewRequired: { type: Boolean, default: false, index: true },
  resolvedAt: Date, closedAt: Date, citizenConfirmedAt: Date, feedback: { rating: Number, comment: String, submittedAt: Date }
}, { timestamps: true });
complaintSchema.index({ createdAt: -1, department: 1, status: 1 });
complaintSchema.index({ title: 'text', description: 'text' });
export const Complaint = mongoose.model('Complaint', complaintSchema);
