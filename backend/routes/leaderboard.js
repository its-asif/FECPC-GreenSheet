import { Router } from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Sheet from '../models/Sheet.js';
import { isAdminEmail } from '../middleware/auth.js';

const router = Router();

// Public leaderboard
router.get('/', async (req, res) => {
  try {
  let users = await User.find({ approved: true }).lean();
  // Exclude admins from the public leaderboard (env or DB role)
  users = users.filter(u => !isAdminEmail(u.email) && !u.isAdmin);
    const sheets = await Sheet.find({}).lean();
    const sheetIds = sheets.map(s => String(s._id));

    const leaderboard = [];
    for (const u of users) {
      const uid = u.uid;
      const progresses = await Progress.find({ userUid: uid }).lean();
      let doneCount = 0;
      for (const p of progresses) {
        doneCount += Object.values(p.statuses || {}).filter((s) => s === 'Done').length;
      }
      const deptBatch = u.department && u.registrationNumber ? `${u.department}-${String(u.registrationNumber).slice(0,2)}` : (u.department || '');
      leaderboard.push({ uid, name: u.fullName || u.email || 'User', deptBatch, doneCount });
    }

    leaderboard.sort((a, b) => b.doneCount - a.doneCount);
    res.json({ leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

export default router;
