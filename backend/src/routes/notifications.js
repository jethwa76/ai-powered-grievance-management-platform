import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router(); router.use(authenticate);
router.get('/', asyncHandler(async (req,res) => { const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50).populate('complaint','ticketId'); res.json({ success:true, data:{ notifications } }); }));
router.patch('/:id/read', asyncHandler(async (req,res) => { const notification = await Notification.findOneAndUpdate({ _id:req.params.id, recipient:req.user._id }, { readAt:new Date() }, { new:true }); res.json({ success:true, data:{ notification } }); }));
export default router;
