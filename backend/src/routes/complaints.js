import { Router } from 'express';
import { Complaint } from '../models/Complaint.js';
import { Timeline } from '../models/Timeline.js';
import { User } from '../models/User.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/error.js';
import { addFeedback, canAccessComplaint, createComplaint, updateStatus } from '../services/complaintService.js';
import { complaintSchema, feedbackSchema, statusSchema } from '../validators/schemas.js';
import { writeAudit } from '../middleware/audit.js';

const router = Router(); router.use(authenticate);
router.post('/', asyncHandler(async (req, res) => { const input = complaintSchema.parse(req.body); const complaint = await createComplaint(input, req.user, req.app.get('io')); await writeAudit(req, complaint._id.toString()); res.status(201).json({ success: true, data: { complaint } }); }));
router.get('/', asyncHandler(async (req, res) => {
  const filter = {}; if (req.user.role === 'citizen') filter.citizen = req.user._id; if (['department_officer','department_admin'].includes(req.user.role)) { filter.department = req.user.department; if (req.user.role === 'department_officer') filter.$or = [{ assignedTo: req.user._id }, { assignedTo: { $exists: false } }]; }
  for (const key of ['status','priority','category']) if (req.query[key]) filter[key] = req.query[key]; if (req.query.department) filter.department = req.query.department; if (req.query.from || req.query.to) filter.createdAt = { ...(req.query.from && { $gte: new Date(req.query.from) }), ...(req.query.to && { $lte: new Date(req.query.to) }) };
  const page = Math.max(1, Number(req.query.page || 1)); const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20))); const [complaints,total] = await Promise.all([Complaint.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate('department','name code').populate('assignedTo','name'), Complaint.countDocuments(filter)]);
  res.json({ success: true, data: { complaints, pagination: { page, limit, total, pages: Math.ceil(total/limit) } } });
}));
router.get('/track/:ticketId', asyncHandler(async (req, res) => { const complaint = await Complaint.findOne({ ticketId: req.params.ticketId }).populate('department','name code').populate('assignedTo','name'); if (!complaint) throw new AppError('Ticket not found', 404, 'NOT_FOUND'); const timeline = await Timeline.find({ complaint: complaint._id }).sort({ createdAt: 1 }).populate('actor','name role'); res.json({ success: true, data: { complaint, timeline } }); }));
router.get('/:id', asyncHandler(async (req, res) => { const complaint = await Complaint.findById(req.params.id).populate('department','name code').populate('citizen','name email').populate('assignedTo','name'); if (!complaint) throw new AppError('Complaint not found', 404, 'NOT_FOUND'); if (!(await canAccessComplaint(complaint, req.user))) throw new AppError('Forbidden', 403, 'FORBIDDEN'); const timeline = await Timeline.find({ complaint: complaint._id }).sort({ createdAt: 1 }).populate('actor','name role'); res.json({ success: true, data: { complaint, timeline } }); }));
router.patch('/:id/status', requireRoles('department_officer','department_admin','super_admin'), asyncHandler(async (req, res) => { const input = statusSchema.parse(req.body); const complaint = await Complaint.findById(req.params.id); if (!complaint || !(await canAccessComplaint(complaint, req.user))) throw new AppError('Complaint not found', 404, 'NOT_FOUND'); const updated = await updateStatus(complaint, input, req.user, req.app.get('io')); await writeAudit(req, req.params.id, { status: input.status }); res.json({ success: true, data: { complaint: updated } }); }));
router.patch('/:id/assign', requireRoles('department_admin','super_admin'), asyncHandler(async (req, res) => { const complaint = await Complaint.findById(req.params.id); const officer = await User.findOne({ _id: req.body.officerId, role: { $in: ['department_officer','department_admin'] }, department: req.user.role === 'super_admin' ? req.body.departmentId || complaint?.department : req.user.department }); if (!complaint || !officer) throw new AppError('Complaint or officer not found', 404, 'NOT_FOUND'); complaint.assignedTo = officer._id; complaint.status = 'assigned'; await complaint.save(); await Timeline.create({ complaint: complaint._id, actor: req.user._id, event: 'assigned', status: 'assigned', metadata: { officerId: officer._id } }); req.app.get('io')?.to(`complaint:${complaint._id}`).emit('complaint:assignment', { complaintId: complaint._id, officer: { id: officer._id, name: officer.name } }); res.json({ success: true, data: { complaint } }); }));
router.post('/:id/feedback', asyncHandler(async (req, res) => { const input = feedbackSchema.parse(req.body); const complaint = await Complaint.findById(req.params.id); if (!complaint) throw new AppError('Complaint not found', 404, 'NOT_FOUND'); const updated = await addFeedback(complaint, input, req.user); res.json({ success: true, data: { complaint: updated } }); }));
router.post('/:id/notes', requireRoles('department_officer','department_admin','super_admin'), asyncHandler(async (req,res) => { const complaint = await Complaint.findById(req.params.id); if (!complaint || !(await canAccessComplaint(complaint, req.user))) throw new AppError('Complaint not found',404,'NOT_FOUND'); const comment = String(req.body.comment || '').trim(); if (!comment || comment.length > 2000) throw new AppError('A note between 1 and 2000 characters is required',400,'VALIDATION_ERROR'); await Timeline.create({ complaint: complaint._id, actor: req.user._id, event: 'internal_note', status: complaint.status, comment, metadata: { internal: true } }); res.status(201).json({ success:true, data:{ message:'Note added' } }); }));
router.put('/:id', asyncHandler(async (req, res) => {
  const input = updateComplaintSchema.parse(req.body);
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new AppError('Complaint not found', 404, 'NOT_FOUND');
  const isOwner = complaint.citizen?.toString() === req.user._id?.toString();
  const isAdmin = ['super_admin', 'department_admin'].includes(req.user.role);
  if (!isOwner && !isAdmin) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (isOwner && !isAdmin && !['submitted', 'under_review'].includes(complaint.status)) {
    throw new AppError('Complaint cannot be edited once in progress', 400, 'INVALID_STATE');
  }
  if (input.title) complaint.title = input.title;
  if (input.description) complaint.description = input.description;
  if (input.category) complaint.category = input.category;
  if (input.urgency || input.priority) complaint.priority = input.urgency || input.priority;
  if (input.location) {
    complaint.location = { ...complaint.location, ...input.location };
  }
  await complaint.save();
  await Timeline.create({ complaint: complaint._id, actor: req.user._id, event: 'complaint_updated', status: complaint.status, comment: 'Complaint details updated.' });
  const updated = await Complaint.findById(complaint._id).populate('department', 'name code').populate('citizen', 'name email').populate('assignedTo', 'name');
  res.json({ success: true, data: { complaint: updated } });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new AppError('Complaint not found', 404, 'NOT_FOUND');
  const isOwner = complaint.citizen?.toString() === req.user._id?.toString();
  const isAdmin = ['super_admin', 'department_admin'].includes(req.user.role);
  if (!isOwner && !isAdmin) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (isOwner && !isAdmin && !['submitted', 'under_review'].includes(complaint.status)) {
    throw new AppError('Complaint cannot be deleted once in progress', 400, 'INVALID_STATE');
  }
  await Complaint.findByIdAndDelete(req.params.id);
  await Timeline.deleteMany({ complaint: req.params.id });
  res.json({ success: true, data: { message: 'Complaint deleted successfully' } });
}));
export default router;
