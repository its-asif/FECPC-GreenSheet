import { Router } from 'express';
import { requireAuth, isAdminEmail } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// Save or update profile; default approved=false when first created
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, department, registrationNumber, phoneNumber } = req.body;
    if (!fullName || !department || !registrationNumber || !phoneNumber) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const uid = req.user.uid;
    const existing = await User.findOne({ uid });
    const userData = {
      uid,
      fullName,
      department,
      registrationNumber,
      phoneNumber,
      email: req.user.email || existing?.email || null,
      approved: existing?.approved ?? false,
    };

    const saved = await User.findOneAndUpdate({ uid }, userData, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ ok: true, user: { uid: saved.uid, ...saved.toObject() } });
  } catch (err) {
    console.error('POST /auth/profile error', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Get my profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    let user = await User.findOne({ uid });
    if (!user) {
      // Auto-create minimal user record so admins can see pending users immediately
      const minimal = {
        uid,
        email: req.user.email || null,
        fullName: req.user.name || '',
        department: '',
        registrationNumber: '',
        phoneNumber: '',
        approved: isAdminEmail(req.user?.email) ? true : false, // auto-approve admins
      };
      user = await User.create(minimal);
    }
    res.json({ user: { uid, ...user.toObject() } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
