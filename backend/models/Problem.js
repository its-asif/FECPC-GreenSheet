import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
  sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sheet', index: true },
  title: String,
  platform: String,
  link: String,
  createdByUid: { type: String, index: true },
}, { timestamps: true });

export default mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);
