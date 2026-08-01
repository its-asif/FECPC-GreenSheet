import User from '../models/User.js';
import Sheet from '../models/Sheet.js';
import Problem from '../models/Problem.js';
import Progress from '../models/Progress.js';
import Badge from '../models/Badge.js';
import UserBadge from '../models/UserBadge.js';
import ActivityLog from '../models/ActivityLog.js';

export const checkAndAwardSheetBadge = async (userUid, sheetId) => {
  try {
    const [sheet, user] = await Promise.all([
      Sheet.findById(sheetId).lean(),
      User.findOne({ uid: userUid }).lean(),
    ]);
    if (!sheet || !user || !user.approved) return;

    const problems = await Problem.find({ sheetId }).lean();
    const totalProblems = problems.length;
    if (totalProblems === 0) return;

    const progress = await Progress.findOne({ userUid, sheetId }).lean();
    const solved = progress ? Object.values(progress.statuses || {}).filter(s => s === 'Done').length : 0;
    const percentage = (solved / totalProblems) * 100;

    // Ensure sheet badges exist for this sheet
    let allSheetBadges = await Badge.find({ type: 'sheet', sheetId }).lean();
    if (allSheetBadges.length < 3) {
      const tiers = [
        { criteria: '100%', color: '#fbbf24', icon: '🥇' },
        { criteria: '80%', color: '#a3a3a3', icon: '🥈' },
        { criteria: '60%', color: '#cd7f32', icon: '🥉' },
      ];
      for (const tier of tiers) {
        const existing = await Badge.findOne({ type: 'sheet', sheetId, criteria: tier.criteria });
        if (!existing) {
          await Badge.create({
            name: `${sheet.name} - ${tier.criteria}`,
            description: `Completed ${tier.criteria} of ${sheet.name}`,
            type: 'sheet',
            sheetId,
            criteria: tier.criteria,
            color: tier.color,
            icon: tier.icon,
          });
        }
      }
      // Re-fetch sheet badges
      allSheetBadges = await Badge.find({ type: 'sheet', sheetId }).lean();
    }

    // Determine highest qualifying tier (only award the highest one)
    let targetCriteria = null;
    if (percentage >= 100) targetCriteria = '100%';
    else if (percentage >= 80) targetCriteria = '80%';
    else if (percentage >= 60) targetCriteria = '60%';

    if (targetCriteria) {
      // Remove other tier badges if user has them
      for (const sheetBadge of allSheetBadges) {
        if (sheetBadge.criteria !== targetCriteria) {
          await UserBadge.deleteOne({ userUid, badgeId: sheetBadge._id });
        }
      }

      // Award the target badge
      const badge = await Badge.findOne({ type: 'sheet', sheetId, criteria: targetCriteria });
      if (badge) {
        const exists = await UserBadge.findOne({ userUid, badgeId: badge._id });
        if (!exists) {
          await UserBadge.create({ userUid, badgeId: badge._id, awardedBy: 'system' });
          await ActivityLog.create({
            userUid,
            action: 'badge_earned',
            metadata: { badgeId: String(badge._id), sheetId: String(sheetId), criteria: targetCriteria },
          });
        }
      }
    } else {
      // If user does not qualify for any tier, remove all sheet badges for this sheet
      for (const sheetBadge of allSheetBadges) {
        await UserBadge.deleteOne({ userUid, badgeId: sheetBadge._id });
      }
    }
  } catch (err) {
    console.error('[checkAndAwardSheetBadge] error:', err);
  }
};
