import mongoose from 'mongoose';

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['sheet', 'manual'], default: 'manual' }, // auto-generated from sheets or manually created
  sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sheet' }, // if type=sheet
  criteria: { type: String }, // e.g., "100%", "80%", "60%"
  color: { type: String, default: '#22c55e' }, // badge color
  icon: { type: String, default: '🏆' }, // emoji or icon
}, { timestamps: true });

export default mongoose.models.Badge || mongoose.model('Badge', BadgeSchema);
