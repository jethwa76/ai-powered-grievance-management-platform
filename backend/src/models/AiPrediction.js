import mongoose from 'mongoose';
const aiPredictionSchema = new mongoose.Schema({ complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', index: true }, modelVersion: String, predictedDepartment: String, predictedCategory: String, confidenceScore: Number, duplicateScore: Number, priorityLevel: String, keywords: [String], summary: String, reviewRequired: Boolean, explanation: String, rawResponse: mongoose.Schema.Types.Mixed }, { timestamps: true });
export const AiPrediction = mongoose.model('AiPrediction', aiPredictionSchema);
