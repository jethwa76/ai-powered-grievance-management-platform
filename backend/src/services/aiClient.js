import axios from 'axios';
import { env } from '../config/env.js';

export async function analyzeComplaint(input, recentComplaints = []) {
  try {
    const { data } = await axios.post(`${env.aiServiceUrl}/v1/analyze`, { ...input, recent_complaints: recentComplaints }, { timeout: 7000 });
    return data;
  } catch (error) {
    console.warn(`AI service unavailable: ${error.message}`);
    return { predicted_department: 'other', predicted_category: input.category || 'Other', confidence_score: 0.1, duplicate_score: 0, priority_level: input.urgency || 'medium', keywords: [], summary: input.description.slice(0, 240), review_required: true, explanation: 'AI service unavailable; manual review required.', model_version: 'fallback' };
  }
}
