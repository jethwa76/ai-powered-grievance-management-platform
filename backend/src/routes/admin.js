import { Router } from 'express';
import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { AiPrediction } from '../models/AiPrediction.js';
import { ReviewQueue } from '../models/ReviewQueue.js';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/error.js';
const router = Router(); router.use(authenticate);
router.get('/analytics', requireRoles('department_admin','super_admin'), asyncHandler(async (req,res) => {
  const scope = req.user.role === 'department_admin' ? { department: req.user.department } : {};
  const [totals, departments, priorities, statuses, reviews, confidence] = await Promise.all([
    Complaint.countDocuments(scope), Complaint.aggregate([{ $match: scope }, { $group: { _id:'$status', count:{ $sum:1 } } }]), Complaint.aggregate([{ $match: scope }, { $group: { _id:'$priority', count:{ $sum:1 } } }]), Complaint.aggregate([{ $match: scope }, { $group: { _id:'$status', count:{ $sum:1 } } }]), ReviewQueue.countDocuments({ status:'pending' }), AiPrediction.aggregate([{ $group:{ _id:null, average:{ $avg:'$confidenceScore' }, low:{ $sum:{ $cond:[{ $lt:['$confidenceScore',0.62] },1,0] } } } }])
  ]);
  const resolved = await Complaint.findOne({ ...scope, resolvedAt: { $exists:true } }).select('createdAt resolvedAt');
  const averageResolutionHours = resolved ? Math.max(0, (resolved.resolvedAt - resolved.createdAt) / 3600000).toFixed(1) : '0.0';
  const departmentMap = Object.fromEntries(departments.map((item)=>[item._id,item.count]));
  res.json({ success:true, data:{ totals, totalComplaints:totals, statuses, byDepartment:departmentMap, byPriority:Object.fromEntries(priorities.map((item)=>[item._id,item.count])), pendingReview:reviews, averageResolutionHours, confidence:confidence[0] || { average:0, low:0 } } });
}));
router.get('/audit-logs', requireRoles('super_admin'), asyncHandler(async (req,res) => { const logs = await AuditLog.find().sort({ createdAt:-1 }).limit(100).populate('actor','name email role'); res.json({ success:true, data:{ logs } }); }));
router.get('/departments', requireRoles('department_admin','super_admin'), asyncHandler(async (_req,res) => { const departments = await Department.find({active:true}).sort('name'); res.json({success:true,data:{departments}}); }));
router.get('/officers', requireRoles('department_admin','super_admin'), asyncHandler(async (req,res) => { const filter = { role:{ $in:['department_officer','department_admin'] } }; if (req.user.role === 'department_admin') filter.department = req.user.department; const officers = await User.find(filter).select('name email role department').populate('department','name'); res.json({success:true,data:{officers}}); }));
export default router;
