import mongoose from 'mongoose';

const UserBadgeSchema = new mongoose.Schema({
  userUid: { type: String, required: true, index: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  awardedAt: { type: Date, default: Date.now },
  awardedBy: { type: String }, // uid of admin who awarded (if manual)
}, { timestamps: true });

UserBadgeSchema.index({ userUid: 1, badgeId: 1 }, { unique: true });

export default mongoose.models.UserBadge || mongoose.model('UserBadge', UserBadgeSchema);
