import mongoose from 'mongoose';

const SheetSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  visibility: { type: String, enum: ['public', 'restricted'], default: 'public' },
}, { timestamps: true });

export default mongoose.models.Sheet || mongoose.model('Sheet', SheetSchema);
