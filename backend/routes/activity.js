import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

const router = Router();

// Admin: Get activity logs with filters
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userUid, action, limit = 100, skip = 0 } = req.query;
    const query = {};
    if (userUid) query.userUid = userUid;
    if (action) query.action = action;

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const userUids = [...new Set(logs.map(l => l.userUid))];
    const users = await User.find({ uid: { $in: userUids } }).lean();
    const userMap = new Map(users.map(u => [u.uid, u.fullName || u.email]));

    const enriched = logs.map(l => ({
      ...l,
      id: String(l._id),
      userName: userMap.get(l.userUid) || 'Unknown',
    }));

    res.json({ logs: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Track login (can be called from auth route)
export const logActivity = async (userUid, action, metadata = {}) => {
  try {
    await ActivityLog.create({ userUid, action, metadata });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

export default router;
