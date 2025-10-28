import { Router } from 'express';
import { requireAuth, isAdminEmail } from '../middleware/auth.js';
import User from '../models/User.js';
import Sheet from '../models/Sheet.js';
import Problem from '../models/Problem.js';
import Progress from '../models/Progress.js';

const router = Router();

// Only approved users can access sheet data
router.get('/', requireAuth, async (req, res) => {
  try {
  const user = await User.findOne({ uid: req.user.uid });
  // Allow admins to read sheets even if not yet approved (env or DB)
  const isAdmin = isAdminEmail(req.user?.email) || !!user?.isAdmin;
    if ((!user || !user.approved) && !isAdmin) {
      return res.status(403).json({ error: 'Waiting for approval' });
    }

    const allSheets = await Sheet.find({}).lean();
    // Preload user's progress counts per sheet
    const progresses = await Progress.find({ userUid: req.user.uid }).lean();
    const doneBySheet = new Map();
    for (const p of progresses) {
      const count = Object.values(p.statuses || {}).filter((s) => s === 'Done').length;
      doneBySheet.set(String(p.sheetId), count);
    }
    const sheets = [];
    for (const s of allSheets) {
      const probs = await Problem.find({ sheetId: s._id }).lean();
      const totalProblems = probs.length;
      const solvedCount = doneBySheet.get(String(s._id)) || 0;
      sheets.push({
        id: String(s._id),
        name: s.name,
        totalProblems,
        solvedCount,
        problems: probs.map(p => ({ id: String(p._id), title: p.title, platform: p.platform, link: p.link }))
      });
    }
    res.json({ sheets });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sheets' });
  }
});

export default router;
