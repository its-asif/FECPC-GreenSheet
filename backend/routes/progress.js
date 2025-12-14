import { Router } from 'express';
import { requireAuth, isAdminEmail } from '../middleware/auth.js';
import Progress from '../models/Progress.js';
import Problem from '../models/Problem.js';
import Sheet from '../models/Sheet.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

const router = Router();

const userCanAccessSheet = (user, sheet, isAdmin) => {
  if (!sheet) return false;
  if ((sheet.visibility || 'public') === 'public') return true;
  if (isAdmin) return true;
  const allowed = (user?.allowedSheets || []).map((id) => String(id));
  return allowed.includes(String(sheet._id));
};

// Get my progress for a sheet
router.get('/:sheetId', requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { sheetId } = req.params;
    const [sheet, user] = await Promise.all([
      Sheet.findById(sheetId).lean(),
      User.findOne({ uid }).lean(),
    ]);
    const isAdmin = isAdminEmail(req.user?.email) || !!user?.isAdmin;
    if (!userCanAccessSheet(user, sheet, isAdmin)) return res.status(403).json({ error: 'No access to this sheet' });
    const prog = await Progress.findOne({ userUid: uid, sheetId }).lean();
    res.json({ statuses: prog?.statuses || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Update a problem status (auto-save)
router.put('/:sheetId/:problemId', requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { sheetId, problemId } = req.params;
    const { status } = req.body; // Unopened, Tried, Done
    if (!['Unopened', 'Tried', 'Done'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const [sheet, user] = await Promise.all([
      Sheet.findById(sheetId).lean(),
      User.findOne({ uid }).lean(),
    ]);
    const isAdmin = isAdminEmail(req.user?.email) || !!user?.isAdmin;
    if (!userCanAccessSheet(user, sheet, isAdmin)) return res.status(403).json({ error: 'No access to this sheet' });

    const now = new Date();
    const update = { $set: { [`statuses.${problemId}`]: status, [`statusTimes.${problemId}`]: now } };
    await Progress.updateOne({ userUid: uid, sheetId }, update, { upsert: true });
    
    // Log activity if problem is marked as Done
    if (status === 'Done') {
      await ActivityLog.create({
        userUid: uid,
        action: 'problem_solved',
        metadata: { problemId, sheetId },
      });
    }
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
