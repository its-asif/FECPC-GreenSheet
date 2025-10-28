import { Router } from 'express';
import { requireAuth, requireAdmin, isAdminEmail } from '../middleware/auth.js';
import User from '../models/User.js';
import Sheet from '../models/Sheet.js';
import Problem from '../models/Problem.js';
import Progress from '../models/Progress.js';

const router = Router();

// List users
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const usersRaw = await User.find({}).lean();
    const users = usersRaw.map(u => ({ ...u, isAdmin: !!u.isAdmin || isAdminEmail(u.email) }));
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Approve or remove user
router.post('/users/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid, approved } = req.body;
    if (!uid || typeof approved !== 'boolean') return res.status(400).json({ error: 'uid and approved required' });
    await User.updateOne({ uid }, { $set: { approved } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update approval' });
  }
});

// Add new sheet
router.post('/sheets', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const sheet = await Sheet.create({ name });
    res.json({ ok: true, sheet: { id: String(sheet._id), name: sheet.name } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add sheet' });
  }
});

// Add problem to a sheet
router.post('/sheets/:sheetId/problems', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { title, platform, link } = req.body;
    if (!title || !platform || !link) return res.status(400).json({ error: 'Missing fields' });
    const problem = await Problem.create({ sheetId, title, platform, link });
    res.json({ ok: true, problem: { id: String(problem._id), title, platform, link } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add problem' });
  }
});

// Bulk add problems to a sheet
router.post('/sheets/:sheetId/problems/bulk', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { bulkText } = req.body;
    if (!bulkText || typeof bulkText !== 'string') return res.status(400).json({ error: 'bulkText string required' });

    const normPlatform = (p) => {
      const s = String(p || '').trim().toLowerCase();
      if (!s) return '';
      if (s.includes('beecrowd')) return 'BeeCrowd';
      if (s.includes('codeforces')) return 'Codeforces';
      if (s.includes('leetcode')) return 'LeetCode';
      if (s.includes('codechef')) return 'CodeChef';
      return p.toString().trim();
    };

    const existing = await Problem.find({ sheetId }).lean();
    const existingTitles = new Set(existing.map(e => (e.title || '').trim().toLowerCase()));

    const lines = bulkText.split(/\r?\n/);
    const added = [];
    const errors = [];
    let skipped = 0;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (!raw || !raw.trim()) continue;
      // split by comma into up to 3 parts: title, platform, link (title may include commas – best effort: take first as title, second as platform, rest joined as link)
      const parts = raw.split(',');
      if (parts.length < 3) { errors.push({ line: i+1, error: 'Expected \'title, platform, link\'' }); continue; }
      const title = parts[0].trim();
      const platform = normPlatform(parts[1]);
      const link = parts.slice(2).join(',').trim();
      if (!title || !platform || !link) { errors.push({ line: i+1, error: 'Missing title/platform/link' }); continue; }
      if (existingTitles.has(title.toLowerCase())) { skipped++; continue; }
      const created = await Problem.create({ sheetId, title, platform, link });
      existingTitles.add(title.toLowerCase());
      added.push({ id: String(created._id), title, platform, link });
    }

    res.json({ ok: true, addedCount: added.length, skippedCount: skipped, errorCount: errors.length, added, errors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk add problems' });
  }
});

// Seed example Green Sheet
router.post('/seed/greensheet', requireAuth, requireAdmin, async (req, res) => {
  try {
    let sheet = await Sheet.findOne({ name: 'Green Sheet' });
    if (!sheet) sheet = await Sheet.create({ name: 'Green Sheet' });
    const sheetId = String(sheet._id);
    const problems = [
      { title: 'BeeCrowd 1000 - Hello World!', platform: 'BeeCrowd', link: 'https://judge.beecrowd.com/en/problems/view/1000' },
      { title: 'BeeCrowd 2748 - Output 2', platform: 'BeeCrowd', link: 'https://judge.beecrowd.com/en/problems/view/2748' },
      { title: 'BeeCrowd 2755 - Output 9', platform: 'BeeCrowd', link: 'https://judge.beecrowd.com/en/problems/view/2755' }
    ];
    for (const p of problems) {
      const exists = await Problem.findOne({ sheetId: sheet._id, title: p.title });
      if (!exists) await Problem.create({ sheetId: sheet._id, ...p });
    }
    res.json({ ok: true, sheetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to seed sheet' });
  }
});

// Admin: list sheets with problem counts
router.get('/sheets', requireAuth, requireAdmin, async (req, res) => {
  try {
    const sheets = await Sheet.find({}).lean();
    const results = [];
    for (const s of sheets) {
      const count = await Problem.countDocuments({ sheetId: s._id });
      results.push({ id: String(s._id), name: s.name, problemCount: count });
    }
    res.json({ sheets: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list sheets' });
  }
});

// Admin: get one sheet with problems
router.get('/sheets/:sheetId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sheetId } = req.params;
    const sheet = await Sheet.findById(sheetId).lean();
    if (!sheet) return res.status(404).json({ error: 'Sheet not found' });
    const problems = await Problem.find({ sheetId }).lean();
    res.json({ sheet: { id: String(sheet._id), name: sheet.name }, problems: problems.map(p=>({ id: String(p._id), title: p.title, platform: p.platform, link: p.link })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sheet' });
  }
});

// Admin: update sheet name
router.put('/sheets/:sheetId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    await Sheet.updateOne({ _id: sheetId }, { $set: { name } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update sheet' });
  }
});

// Admin: delete sheet (and its problems and progresses)
router.delete('/sheets/:sheetId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sheetId } = req.params;
    await Problem.deleteMany({ sheetId });
    await Progress.deleteMany({ sheetId });
    await Sheet.deleteOne({ _id: sheetId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete sheet' });
  }
});

// Admin: update problem
router.put('/problems/:problemId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { title, platform, link } = req.body;
    const update = {};
    if (title) update.title = title;
    if (platform) update.platform = platform;
    if (link) update.link = link;
    await Problem.updateOne({ _id: problemId }, { $set: update });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// Admin: delete problem and remove it from progress maps
router.delete('/problems/:problemId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { problemId } = req.params;
    await Problem.deleteOne({ _id: problemId });
    const unsetKeys = { };
    unsetKeys[`statuses.${problemId}`] = "";
    unsetKeys[`statusTimes.${problemId}`] = "";
    await Progress.updateMany({}, { $unset: unsetKeys });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// Admin: get user details (+basic stats)
router.get('/users/:uid', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const progresses = await Progress.find({ userUid: uid }).lean();
    let doneCount = 0;
    const statusByProblemId = new Map(); // pid -> status
    const timeByProblemId = new Map(); // pid -> Date
    for (const p of progresses) {
      const statuses = p.statuses || {};
      const times = p.statusTimes || {};
      for (const [pid, status] of Object.entries(statuses)) {
        if (status === 'Done') doneCount += 1;
        statusByProblemId.set(pid, status);
        if (times && times[pid]) timeByProblemId.set(pid, new Date(times[pid]));
      }
    }

    const allProblemIds = [...statusByProblemId.keys()];
    let problemsCombined = [];
    if (allProblemIds.length) {
      const uniqueIds = [...new Set(allProblemIds)];
      const problems = await Problem.find({ _id: { $in: uniqueIds } }).lean();
      const sheetIds = [...new Set(problems.map(p => String(p.sheetId)))];
      const sheets = await Sheet.find({ _id: { $in: sheetIds } }).lean();
      const sheetNameById = new Map(sheets.map(s => [String(s._id), s.name]));
      const byId = new Map(problems.map(p=>[String(p._id), p]));
      problemsCombined = uniqueIds
        .map(pid => {
          const p = byId.get(String(pid));
          if (!p) return null;
          return {
            id: String(p._id),
            title: p.title,
            platform: p.platform,
            link: p.link,
            sheetId: String(p.sheetId),
            sheetName: sheetNameById.get(String(p.sheetId)) || '',
            status: statusByProblemId.get(String(pid)) || 'Unopened',
            time: timeByProblemId.get(String(pid)) || null,
          };
        })
        .filter(Boolean)
        .sort((a,b) => {
          // newest first if time exists, otherwise by sheet then title
          if (a.time && b.time) return b.time - a.time;
          if (a.time && !b.time) return -1;
          if (!a.time && b.time) return 1;
          return a.sheetName.localeCompare(b.sheetName) || a.title.localeCompare(b.title);
        });
    }

    const solvedProblems = problemsCombined.filter(p => p.status === 'Done');

    res.json({ user: { ...user, isAdmin: !!user.isAdmin || isAdminEmail(user.email) }, stats: { doneCount }, solvedProblems, problems: problemsCombined });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Admin: delete a user and their progress (safe-guard: cannot delete yourself)
router.delete('/users/:uid', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    if (uid === req.user?.uid) return res.status(400).json({ error: 'Cannot delete your own account' });
    await Progress.deleteMany({ userUid: uid });
    await User.deleteOne({ uid });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin: set/unset another user's admin role
router.post('/users/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid, isAdmin } = req.body;
    if (!uid || typeof isAdmin !== 'boolean') return res.status(400).json({ error: 'uid and isAdmin required' });
    await User.updateOne({ uid }, { $set: { isAdmin } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
