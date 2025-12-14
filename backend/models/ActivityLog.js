import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  userUid: { type: String, required: true, index: true },
  action: { type: String, required: true }, // e.g., 'login', 'problem_solved', 'badge_earned', 'sheet_completed'
  metadata: { type: Object, default: {} }, // flexible field for extra data
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
