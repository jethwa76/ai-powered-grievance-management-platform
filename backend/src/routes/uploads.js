import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/error.js';
import { Complaint } from '../models/Complaint.js';
import { Attachment } from '../models/Attachment.js';

const router = Router();
const allowed = new Set(['image/jpeg','image/png','image/webp','application/pdf']);
const upload = multer({ storage:multer.memoryStorage(), limits:{fileSize:10*1024*1024}, fileFilter:(_req,file,cb)=>cb(null,allowed.has(file.mimetype)) });
router.post('/:complaintId', authenticate, upload.array('files',5), asyncHandler(async (req,res)=>{ const complaint=await Complaint.findById(req.params.complaintId); if(!complaint) throw new AppError('Complaint not found',404,'NOT_FOUND'); if(!complaint.citizen.equals(req.user._id) && !['department_officer','department_admin','super_admin'].includes(req.user.role)) throw new AppError('Forbidden',403,'FORBIDDEN'); if(!req.files?.length) throw new AppError('No valid files supplied',400,'INVALID_UPLOAD'); const directory=path.resolve(process.cwd(),'uploads'); await fs.mkdir(directory,{recursive:true}); const attachments=[]; for(const file of req.files){ const checksum=crypto.createHash('sha256').update(file.buffer).digest('hex'); const extension=path.extname(file.originalname).toLowerCase() || '.bin'; const storageKey=`${crypto.randomUUID()}${extension}`; await fs.writeFile(path.join(directory,storageKey),file.buffer,{flag:'wx'}); const attachment=await Attachment.create({complaint:complaint._id,uploadedBy:req.user._id,originalName:file.originalname,storageKey,url:`/uploads/${storageKey}`,mimeType:file.mimetype,size:file.size,checksum,scanStatus:'clean'}); complaint.attachments.push({url:attachment.url,publicId:attachment.storageKey,filename:file.originalname,mimeType:file.mimetype,size:file.size,checksum}); attachments.push(attachment); } await complaint.save(); res.status(201).json({success:true,data:{attachments}}); }));
export default router;
