import mongoose from 'mongoose';

const SheetSchema = new mongoose.Schema({
  name: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.models.Sheet || mongoose.model('Sheet', SheetSchema);
