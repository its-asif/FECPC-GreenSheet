import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Progress from '../models/Progress.js';
import Problem from '../models/Problem.js';
import Sheet from '../models/Sheet.js';

const router = Router();

// Get my progress for a sheet
router.get('/:sheetId', requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { sheetId } = req.params;
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

    const now = new Date();
    const update = { $set: { [`statuses.${problemId}`]: status, [`statusTimes.${problemId}`]: now } };
    await Progress.updateOne({ userUid: uid, sheetId }, update, { upsert: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
