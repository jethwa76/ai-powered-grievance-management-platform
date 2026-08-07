import mongoose from 'mongoose';
const attachmentSchema = new mongoose.Schema({ complaint:{type:mongoose.Schema.Types.ObjectId,ref:'Complaint',index:true}, uploadedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, originalName:String, storageKey:{type:String,unique:true}, url:String, mimeType:String, size:Number, checksum:String, scanStatus:{type:String,enum:['pending','clean','quarantined'],default:'pending'} },{timestamps:true});
export const Attachment = mongoose.model('Attachment',attachmentSchema);
