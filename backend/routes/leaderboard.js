import { Router } from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Sheet from '../models/Sheet.js';
import { isAdminEmail } from '../middleware/auth.js';

const router = Router();

const canSeeSheet = (user, sheet) => {
  if (!sheet) return false;
  if ((sheet.visibility || 'public') === 'public') return true;
  if (isAdminEmail(user.email) || user.isAdmin) return true;
  const allowed = (user.allowedSheets || []).map((id) => String(id));
  return allowed.includes(String(sheet._id));
};

// Public leaderboard with filters
router.get('/', async (req, res) => {
  try {
    const { sheetId, department, batch, includeAdmins = 'false', includePending = 'false', sortBy = 'done', sortDir = 'desc', limit } = req.query;

    const sheet = sheetId ? await Sheet.findById(sheetId).lean() : null;
    if (sheetId && !sheet) return res.status(404).json({ error: 'Sheet not found' });

    const userQuery = {};
    if (includePending !== 'true') userQuery.approved = true;
    if (department) userQuery.department = department;
    if (batch) userQuery.registrationNumber = { $regex: batch, $options: 'i' };

    let users = await User.find(userQuery).lean();
    if (includeAdmins !== 'true') {
      users = users.filter((u) => !isAdminEmail(u.email) && !u.isAdmin);
    }

    const progresses = await Progress.find(sheetId ? { sheetId } : {}).lean();
    const doneByUser = new Map();
    for (const p of progresses) {
      const uid = p.userUid;
      const done = Object.values(p.statuses || {}).filter((s) => s === 'Done').length;
      doneByUser.set(uid, (doneByUser.get(uid) || 0) + done);
    }

    const leaderboard = [];
    for (const u of users) {
      if (sheet && !canSeeSheet(u, sheet)) continue;
      const doneCount = sheet ? (doneByUser.get(u.uid) || 0) : (doneByUser.get(u.uid) || 0);
      leaderboard.push({
        uid: u.uid,
        name: u.fullName || u.email || 'User',
        deptBatch: u.department && u.registrationNumber ? `${u.department}-${String(u.registrationNumber)}` : (u.department || ''),
        department: u.department || '',
        registrationNumber: u.registrationNumber || '',
        doneCount,
      });
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    const comparator = {
      done: (a, b) => (a.doneCount - b.doneCount) * dir,
      name: (a, b) => (a.name || '').localeCompare(b.name || '') * dir,
      department: (a, b) => (a.department || '').localeCompare(b.department || '') * dir,
    }[sortBy] || ((a, b) => (a.doneCount - b.doneCount) * dir);
    leaderboard.sort((a, b) => comparator(a, b));

    const lim = Number(limit);
    const sliced = Number.isFinite(lim) && lim > 0 ? leaderboard.slice(0, lim) : leaderboard;

    const sheets = await Sheet.find({}).lean();
    const sheetOptions = sheets.map((s) => ({ id: String(s._id), name: s.name, visibility: s.visibility || 'public' }));

    res.json({ leaderboard: sliced, sheets: sheetOptions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

export default router;
