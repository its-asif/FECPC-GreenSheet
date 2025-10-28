import { verifyFirebaseIdToken } from '../utils/firebaseVerify.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const decoded = await verifyFirebaseIdToken(token, projectId);
    // Normalize fields similar to firebase-admin output
    req.user = {
      uid: decoded.user_id || decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      ...decoded,
    };
    next();
  } catch (err) {
    console.error('requireAuth error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function requireAdmin(req, res, next) {
  try {
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    const email = (req.user?.email || '').toLowerCase();
    if (email && admins.includes(email)) return next();

    // Fallback to DB role check
    const uid = req.user?.uid;
    if (!uid) return res.status(403).json({ error: 'Admin only' });
    const user = await User.findOne({ uid }).lean();
    if (user?.isAdmin) return next();
    return res.status(403).json({ error: 'Admin only' });
  } catch (e) {
    return res.status(403).json({ error: 'Admin only' });
  }
}

export function isAdminEmail(email) {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return !!email && admins.includes(String(email).toLowerCase());
}
