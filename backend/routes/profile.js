import { Router } from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Problem from '../models/Problem.js';
import Sheet from '../models/Sheet.js';
import UserBadge from '../models/UserBadge.js';
import Badge from '../models/Badge.js';

const router = Router();

// Public profile endpoint (no auth required)
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Only expose public data
    const publicProfile = {
      uid: user.uid,
      fullName: user.fullName || 'User',
      department: user.department || '',
      registrationNumber: user.registrationNumber || '',
      // Hide: email, phoneNumber, approved status
    };

    // Get badges
    const userBadges = await UserBadge.find({ userUid: uid }).populate('badgeId').lean();
    const badges = userBadges.map(ub => ({
      ...ub.badgeId,
      id: String(ub.badgeId._id),
      awardedAt: ub.awardedAt,
    }));

    // Get problem stats
    const progresses = await Progress.find({ userUid: uid }).lean();
    let totalSolved = 0;
    let totalTried = 0;
    const sheetStats = [];

    for (const p of progresses) {
      const statuses = p.statuses || {};
      const solved = Object.values(statuses).filter(s => s === 'Done').length;
      const tried = Object.values(statuses).filter(s => s === 'Tried').length;
      totalSolved += solved;
      totalTried += tried;

      const sheet = await Sheet.findById(p.sheetId).lean();
      const totalProblems = await Problem.countDocuments({ sheetId: p.sheetId });
      
      if (sheet) {
        sheetStats.push({
          sheetName: sheet.name,
          solved,
          tried,
          total: totalProblems,
          percentage: totalProblems > 0 ? Math.round((solved / totalProblems) * 100) : 0,
        });
      }
    }

    res.json({
      profile: publicProfile,
      badges,
      stats: {
        totalSolved,
        totalTried,
        sheetStats,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
});

export default router;
