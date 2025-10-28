import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  userUid: { type: String, index: true },
  sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sheet', index: true },
  statuses: { type: Map, of: String, default: {} }, // problemId -> status
  statusTimes: { type: Map, of: Date, default: {} }, // problemId -> last updated time
}, { timestamps: true });

export default mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
