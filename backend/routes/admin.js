import { Router } from 'express';
import { requireAuth, requireAdmin, isAdminEmail } from '../middleware/auth.js';
import User from '../models/User.js';
import Sheet from '../models/Sheet.js';
import Problem from '../models/Problem.js';
import Progress from '../models/Progress.js';
import ActivityLog from '../models/ActivityLog.js';

const router = Router();

const withAdminFlag = (user) => ({ ...user, isAdmin: !!user.isAdmin || isAdminEmail(user.email) });

const buildProblemCountMap = async () => {
  const grouped = await Problem.aggregate([
    { $match: { createdByUid: { $exists: true, $ne: null } } },
    { $group: { _id: '$createdByUid', count: { $sum: 1 } } },
  ]);
  return new Map(grouped.map((g) => [g._id, g.count]));
};

const buildDoneCountMap = async () => {
  const grouped = await Progress.aggregate([
    { $project: { userUid: 1, statuses: { $objectToArray: '$statuses' } } },
    { $unwind: { path: '$statuses', preserveNullAndEmptyArrays: true } },
    { $match: { 'statuses.v': 'Done' } },
    { $group: { _id: '$userUid', count: { $sum: 1 } } },
  ]);
  return new Map(grouped.map((g) => [g._id, g.count]));
};

const userHasSheetAccess = (user, sheet) => {
  if (!sheet) return false;
  if ((sheet.visibility || 'public') === 'public') return true;
  if (!user) return false;
  if (isAdminEmail(user.email) || user.isAdmin) return true;
  const allowed = (user.allowedSheets || []).map((id) => String(id));
  return allowed.includes(String(sheet._id));
};

// Admin: fill missing schema defaults across existing documents
router.post('/maintenance/fill-defaults', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [usersAllowed, usersAdmin, usersApproved, sheetsVisibility, problemsCreatedBy] = await Promise.all([
      User.updateMany({ allowedSheets: { $exists: false } }, { $set: { allowedSheets: [] } }),
      User.updateMany({ isAdmin: { $exists: false } }, { $set: { isAdmin: false } }),
      User.updateMany({ approved: { $exists: false } }, { $set: { approved: false } }),
      Sheet.updateMany({ visibility: { $exists: false } }, { $set: { visibility: 'public' } }),
      Problem.updateMany({ createdByUid: { $exists: false } }, { $set: { createdByUid: null } }),
    ]);

    res.json({
      ok: true,
      updated: {
        usersAllowed: usersAllowed.modifiedCount,
        usersAdmin: usersAdmin.modifiedCount,
        usersApproved: usersApproved.modifiedCount,
        sheetsVisibility: sheetsVisibility.modifiedCount,
        problemsCreatedBy: problemsCreatedBy.modifiedCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fill defaults' });
  }
});

// List users with filters, problem counts, and sorting
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { department, batch, search, approved, admin, sortBy = 'createdAt', sortDir = 'desc' } = req.query;
    const query = {};
    if (department) query.department = department;
    if (batch) query.registrationNumber = { $regex: batch, $options: 'i' };
    if (approved === 'true') query.approved = true;
    if (approved === 'false') query.approved = false;

    let users = await User.find(query).lean();
    const problemCount = await buildProblemCountMap();
    const doneCount = await buildDoneCountMap();

    users = users.map((u) => {
      const withAdmin = withAdminFlag(u);
      return {
        ...withAdmin,
        problemsAddedCount: problemCount.get(u.uid) || 0,
        doneCount: doneCount.get(u.uid) || 0,
      };
    });

    if (admin === 'true') users = users.filter((u) => u.isAdmin);
    if (admin === 'false') users = users.filter((u) => !u.isAdmin);

    if (search) {
      const s = search.toLowerCase();
      users = users.filter((u) =>
        (u.fullName || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.department || '').toLowerCase().includes(s) ||
        (u.registrationNumber || '').toLowerCase().includes(s)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    const comparator = {
      createdAt: (a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * dir,
      name: (a, b) => (a.fullName || '').localeCompare(b.fullName || '') * dir,
      department: (a, b) => (a.department || '').localeCompare(b.department || '') * dir,
      problemsAdded: (a, b) => (a.problemsAddedCount - b.problemsAddedCount) * dir,
      done: (a, b) => (a.doneCount - b.doneCount) * dir,
    }[sortBy] || ((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * dir);

    users.sort((a, b) => comparator(a, b));
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
    
    // Log activity
    await ActivityLog.create({
      userUid: uid,
      action: approved ? 'user_approved' : 'user_unapproved',
      metadata: { approvedBy: req.user.uid },
    });
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update approval' });
  }
});

// Bulk approve users
router.post('/users/bulk-approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uids, approved } = req.body;
    if (!Array.isArray(uids) || typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'uids array and approved boolean required' });
    }
    
    await User.updateMany({ uid: { $in: uids } }, { $set: { approved } });
    
    // Log activity for each user
    for (const uid of uids) {
      await ActivityLog.create({
        userUid: uid,
        action: approved ? 'user_approved' : 'user_unapproved',
        metadata: { approvedBy: req.user.uid, bulk: true },
      });
    }
    
    res.json({ ok: true, count: uids.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk approve users' });
  }
});

// Grant or revoke sheet access for a user
router.post('/users/:uid/permissions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { sheetId, allow } = req.body;
    if (!sheetId || typeof allow !== 'boolean') return res.status(400).json({ error: 'sheetId and allow required' });

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) return res.status(404).json({ error: 'Sheet not found' });
    if ((sheet.visibility || 'public') === 'public') return res.status(400).json({ error: 'Sheet is already public' });

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allowed = new Set((user.allowedSheets || []).map((id) => String(id)));
    if (allow) allowed.add(String(sheet._id));
    else allowed.delete(String(sheet._id));

    user.allowedSheets = [...allowed];
    await user.save();
    res.json({ ok: true, allowedSheets: user.allowedSheets.map(String) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

// Add new sheet
router.post('/sheets', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, visibility = 'public' } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const sheet = await Sheet.create({ name, visibility: ['public', 'restricted'].includes(visibility) ? visibility : 'public' });
    res.json({ ok: true, sheet: { id: String(sheet._id), name: sheet.name, visibility: sheet.visibility } });
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
    const problem = await Problem.create({ sheetId, title, platform, link, createdByUid: req.user.uid });
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
    const existingTitles = new Set(existing.map((e) => (e.title || '').trim().toLowerCase()));

    const lines = bulkText.split(/\r?\n/);
    const added = [];
    const errors = [];
    let skipped = 0;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (!raw || !raw.trim()) continue;
      const parts = raw.split(',');
      if (parts.length < 3) { errors.push({ line: i + 1, error: "Expected 'title, platform, link'" }); continue; }
      const title = parts[0].trim();
      const platform = normPlatform(parts[1]);
      const link = parts.slice(2).join(',').trim();
      if (!title || !platform || !link) { errors.push({ line: i + 1, error: 'Missing title/platform/link' }); continue; }
      if (existingTitles.has(title.toLowerCase())) { skipped++; continue; }
      const created = await Problem.create({ sheetId, title, platform, link, createdByUid: req.user.uid });
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
    if (!sheet) sheet = await Sheet.create({ name: 'Green Sheet', visibility: 'restricted' });
    const sheetId = String(sheet._id);
    const problems = [
      { title: 'BeeCrowd 1000 - Hello World!', platform: 'BeeCrowd', link: 'https://judge.beecrowd.com/en/problems/view/1000' },
      { title: 'BeeCrowd 2748 - Output 2', platform: 'BeeCrowd', link: 'https://judge.beecrowd.com/en/problems/view/2748' },
      { title: 'BeeCrowd 2755 - Output 9', platform: 'BeeCrowd', link: 'https://judge.beecrowd.com/en/problems/view/2755' },
    ];
    for (const p of problems) {
      const exists = await Problem.findOne({ sheetId: sheet._id, title: p.title });
      if (!exists) await Problem.create({ sheetId: sheet._id, createdByUid: req.user.uid, ...p });
    }
    res.json({ ok: true, sheetId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed sheet' });
  }
});

// Admin: list sheets with problem counts and visibility
router.get('/sheets', requireAuth, requireAdmin, async (req, res) => {
  try {
    const sheets = await Sheet.find({}).lean();
    const results = [];
    for (const s of sheets) {
      const count = await Problem.countDocuments({ sheetId: s._id });
      results.push({ id: String(s._id), name: s.name, visibility: s.visibility || 'public', problemCount: count });
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
    res.json({ sheet: { id: String(sheet._id), name: sheet.name, visibility: sheet.visibility || 'public' }, problems: problems.map((p) => ({ id: String(p._id), title: p.title, platform: p.platform, link: p.link })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sheet' });
  }
});

// Admin: update sheet name/visibility
router.put('/sheets/:sheetId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { name, visibility } = req.body;
    const update = {};
    if (name) update.name = name;
    if (visibility && ['public', 'restricted'].includes(visibility)) update.visibility = visibility;
    if (!Object.keys(update).length) return res.status(400).json({ error: 'Nothing to update' });
    await Sheet.updateOne({ _id: sheetId }, { $set: update });
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
    await User.updateMany({}, { $pull: { allowedSheets: sheetId } });
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
    const unsetKeys = {};
    unsetKeys[`statuses.${problemId}`] = '';
    unsetKeys[`statusTimes.${problemId}`] = '';
    await Progress.updateMany({}, { $unset: unsetKeys });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// Admin: get user details (+basic stats and access)
router.get('/users/:uid', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const progresses = await Progress.find({ userUid: uid }).lean();
    let doneCount = 0;
    const statusByProblemId = new Map();
    const timeByProblemId = new Map();
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
      const sheetIds = [...new Set(problems.map((p) => String(p.sheetId)))];
      const sheets = await Sheet.find({ _id: { $in: sheetIds } }).lean();
      const sheetNameById = new Map(sheets.map((s) => [String(s._id), s.name]));
      const byId = new Map(problems.map((p) => [String(p._id), p]));
      problemsCombined = uniqueIds
        .map((pid) => {
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
        .sort((a, b) => {
          if (a.time && b.time) return b.time - a.time;
          if (a.time && !b.time) return -1;
          if (!a.time && b.time) return 1;
          return a.sheetName.localeCompare(b.sheetName) || a.title.localeCompare(b.title);
        });
    }

    const solvedProblems = problemsCombined.filter((p) => p.status === 'Done');
    const problemsAddedCount = await Problem.countDocuments({ createdByUid: uid });

    const sheets = await Sheet.find({}).lean();
    const allowed = new Set((user.allowedSheets || []).map((id) => String(id)));
    const enrichedUser = withAdminFlag(user);
    const sheetAccess = sheets.map((s) => ({
      id: String(s._id),
      name: s.name,
      visibility: s.visibility || 'public',
      hasAccess: userHasSheetAccess(enrichedUser, s),
      granted: allowed.has(String(s._id)),
    }));

    res.json({ user: enrichedUser, stats: { doneCount, problemsAddedCount }, solvedProblems, problems: problemsCombined, sheetAccess });
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
