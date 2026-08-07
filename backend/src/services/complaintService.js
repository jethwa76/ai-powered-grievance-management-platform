import crypto from 'node:crypto';
import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';
import { Timeline } from '../models/Timeline.js';
import { Notification } from '../models/Notification.js';
import { AiPrediction } from '../models/AiPrediction.js';
import { ReviewQueue } from '../models/ReviewQueue.js';
import { analyzeComplaint } from './aiClient.js';
import { AppError } from '../middleware/error.js';

function ticketId() { return `GRV-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`; }
export async function createComplaint(input, citizen, io) {
  const recent = await Complaint.find({ status: { $nin: ['closed'] } }).sort({ createdAt: -1 }).limit(100).select('title description category department ticketId');
  const analysis = await analyzeComplaint(input, recent.map((item) => ({ id: item._id.toString(), title: item.title, description: item.description, category: item.category })));
  const department = await Department.findOne({ code: analysis.predicted_department }) || await Department.findOne({ code: input.department }) || await Department.findOne({ code: 'other' });
  const complaint = await Complaint.create({ ...input, ticketId: ticketId(), citizen: citizen._id, department: department?._id, category: analysis.predicted_category, priority: analysis.priority_level, aiReviewRequired: analysis.review_required, status: analysis.review_required ? 'under_review' : 'assigned' });
  await AiPrediction.create({ complaint: complaint._id, modelVersion: analysis.model_version, predictedDepartment: analysis.predicted_department, predictedCategory: analysis.predicted_category, confidenceScore: analysis.confidence_score, duplicateScore: analysis.duplicate_score, priorityLevel: analysis.priority_level, keywords: analysis.keywords, summary: analysis.summary, reviewRequired: analysis.review_required, explanation: analysis.explanation, rawResponse: analysis });
  await Timeline.create({ complaint: complaint._id, actor: citizen._id, event: 'complaint_submitted', status: complaint.status, comment: analysis.review_required ? 'Submitted for specialist review.' : 'AI-assisted routing completed.' });
  if (analysis.review_required) await ReviewQueue.create({ complaint: complaint._id, reason: analysis.explanation });
  await Notification.create({ recipient: citizen._id, type: 'complaint_created', title: 'Complaint received', message: `${complaint.ticketId} has been registered.`, complaint: complaint._id });
  io?.to(`citizen:${citizen._id}`).emit('complaint:created', { ticketId: complaint.ticketId, status: complaint.status });
  return Complaint.findById(complaint._id).populate('department', 'name code').populate('citizen', 'name email');
}

export async function canAccessComplaint(complaint, user) {
  if (['super_admin','ai_review_officer'].includes(user.role)) return true;
  if (user.role === 'citizen') return complaint.citizen._id?.equals(user._id) || complaint.citizen.equals(user._id);
  return user.department && complaint.department?._id?.equals(user.department) || user.department?.equals(complaint.department);
}

export async function updateStatus(complaint, input, actor, io) {
  const previous = complaint.status;
  complaint.status = input.status;
  if (input.status === 'resolved') complaint.resolvedAt = new Date();
  if (input.status === 'closed') complaint.closedAt = new Date();
  await complaint.save();
  await Timeline.create({ complaint: complaint._id, actor: actor._id, event: 'status_changed', status: input.status, comment: input.comment });
  await Notification.create({ recipient: complaint.citizen, type: 'status_update', title: 'Complaint status updated', message: `${complaint.ticketId} changed from ${previous} to ${input.status}.`, complaint: complaint._id });
  io?.to(`complaint:${complaint._id}`).emit('complaint:status', { complaintId: complaint._id, ticketId: complaint.ticketId, previous, status: input.status, comment: input.comment });
  return complaint;
}

export async function addFeedback(complaint, input, citizen) {
  if (!complaint.citizen.equals(citizen._id)) throw new AppError('Only the complainant can provide feedback', 403, 'FORBIDDEN');
  if (!['resolved','closed'].includes(complaint.status)) throw new AppError('Feedback is available after resolution', 409, 'INVALID_STATE');
  complaint.feedback = { ...input, submittedAt: new Date() };
  await complaint.save();
  await Timeline.create({ complaint: complaint._id, actor: citizen._id, event: 'feedback_submitted', status: complaint.status, metadata: input });
  return complaint;
}
