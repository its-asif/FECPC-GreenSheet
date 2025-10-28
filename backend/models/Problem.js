import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
  sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sheet', index: true },
  title: String,
  platform: String,
  link: String,
}, { timestamps: true });

export default mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);
