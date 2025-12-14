import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Badge from '../models/Badge.js';
import UserBadge from '../models/UserBadge.js';
import User from '../models/User.js';
import Sheet from '../models/Sheet.js';
import Problem from '../models/Problem.js';
import Progress from '../models/Progress.js';
import ActivityLog from '../models/ActivityLog.js';

const router = Router();

// Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find({}).lean();
    res.json({ badges: badges.map(b => ({ ...b, id: String(b._id) })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get user's badges
router.get('/user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userBadges = await UserBadge.find({ userUid: uid }).populate('badgeId').lean();
    const badges = userBadges.map(ub => ({
      ...ub.badgeId,
      id: String(ub.badgeId._id),
      awardedAt: ub.awardedAt,
      awardedBy: ub.awardedBy,
    }));
    res.json({ badges });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
});

// Admin: Create manual badge
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const badge = await Badge.create({
      name,
      description: description || '',
      type: 'manual',
      color: color || '#22c55e',
      icon: icon || '🏆',
    });
    res.json({ ok: true, badge: { ...badge.toObject(), id: String(badge._id) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create badge' });
  }
});

// Admin: Award badge to user
router.post('/award', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userUid, badgeId } = req.body;
    if (!userUid || !badgeId) return res.status(400).json({ error: 'userUid and badgeId required' });
    
    const exists = await UserBadge.findOne({ userUid, badgeId });
    if (exists) return res.status(400).json({ error: 'Badge already awarded' });

    const userBadge = await UserBadge.create({ userUid, badgeId, awardedBy: req.user.uid });
    
    // Log activity
    await ActivityLog.create({
      userUid,
      action: 'badge_earned',
      metadata: { badgeId, awardedBy: req.user.uid },
    });

    res.json({ ok: true, userBadge });
  } catch (err) {
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// Admin: Revoke badge from user
router.delete('/award', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userUid, badgeId } = req.body;
    if (!userUid || !badgeId) return res.status(400).json({ error: 'userUid and badgeId required' });
    await UserBadge.deleteOne({ userUid, badgeId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke badge' });
  }
});

// Admin: Auto-generate sheet badges (create badges for all sheets based on completion %)
router.post('/generate-sheet-badges', requireAuth, requireAdmin, async (req, res) => {
  try {
    const sheets = await Sheet.find({}).lean();
    console.log(`Found ${sheets.length} sheets to generate badges for`);
    let created = 0;

    for (const sheet of sheets) {
      console.log(`Processing sheet: ${sheet.name} (${sheet._id})`);
      const tiers = [
        { criteria: '100%', color: '#fbbf24', icon: '🥇' },
        { criteria: '80%', color: '#a3a3a3', icon: '🥈' },
        { criteria: '60%', color: '#cd7f32', icon: '🥉' },
      ];

      for (const tier of tiers) {
        const name = `${sheet.name} - ${tier.criteria}`;
        const existing = await Badge.findOne({ type: 'sheet', sheetId: sheet._id, criteria: tier.criteria });
        if (!existing) {
          const newBadge = await Badge.create({
            name,
            description: `Completed ${tier.criteria} of ${sheet.name}`,
            type: 'sheet',
            sheetId: sheet._id,
            criteria: tier.criteria,
            color: tier.color,
            icon: tier.icon,
          });
          console.log(`Created badge: ${name}`);
          created++;
        } else {
          console.log(`Badge already exists: ${name}`);
        }
      }
    }

    console.log(`Total badges created: ${created}`);
    res.json({ ok: true, created, totalSheets: sheets.length });
  } catch (err) {
    console.error('Generate badges error:', err);
    res.status(500).json({ error: 'Failed to generate sheet badges', details: err.message });
  }
});

// Admin: Auto-award sheet badges based on user progress
router.post('/auto-award-sheet-badges', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('=== Starting auto-award process ===');
    const users = await User.find({ approved: true }).lean();
    console.log(`Found ${users.length} approved users`);
    
    const sheets = await Sheet.find({}).lean();
    console.log(`Found ${sheets.length} sheets`);
    let awarded = 0;

    for (const user of users) {
      console.log(`\nProcessing user: ${user.name} (${user.uid})`);
      
      for (const sheet of sheets) {
        console.log(`  Sheet: ${sheet.name} (${sheet._id})`);
        
        const problems = await Problem.find({ sheetId: sheet._id }).lean();
        const totalProblems = problems.length;
        console.log(`    Total problems: ${totalProblems}`);
        
        if (totalProblems === 0) {
          console.log(`    Skipping - no problems`);
          continue;
        }

        const progress = await Progress.findOne({ userUid: user.uid, sheetId: sheet._id }).lean();
        console.log(`    Progress doc exists: ${!!progress}`);
        
        const solved = progress ? Object.values(progress.statuses || {}).filter(s => s === 'Done').length : 0;
        const percentage = (solved / totalProblems) * 100;
        console.log(`    Solved: ${solved}/${totalProblems} (${percentage.toFixed(1)}%)`);

        // Determine highest qualifying tier (only award the highest one)
        let targetCriteria = null;
        if (percentage >= 100) targetCriteria = '100%';
        else if (percentage >= 80) targetCriteria = '80%';
        else if (percentage >= 60) targetCriteria = '60%';
        
        console.log(`    Target badge: ${targetCriteria || 'none'}`);

        if (targetCriteria) {
          // Find all sheet badges for this sheet
          const allSheetBadges = await Badge.find({ type: 'sheet', sheetId: sheet._id }).lean();
          
          // Remove lower tier badges if user has them
          for (const sheetBadge of allSheetBadges) {
            if (sheetBadge.criteria !== targetCriteria) {
              const existingAward = await UserBadge.findOne({ userUid: user.uid, badgeId: sheetBadge._id });
              if (existingAward) {
                await UserBadge.deleteOne({ _id: existingAward._id });
                console.log(`    ✗ Removed ${sheetBadge.criteria} badge`);
              }
            }
          }
          
          // Award the target badge
          const badge = await Badge.findOne({ type: 'sheet', sheetId: sheet._id, criteria: targetCriteria });
          console.log(`    Badge ${targetCriteria} exists: ${!!badge}`);
          
          if (badge) {
            const exists = await UserBadge.findOne({ userUid: user.uid, badgeId: badge._id });
            console.log(`    Already awarded ${targetCriteria}: ${!!exists}`);
            
            if (!exists) {
              await UserBadge.create({ userUid: user.uid, badgeId: badge._id, awardedBy: 'system' });
              await ActivityLog.create({
                userUid: user.uid,
                action: 'badge_earned',
                metadata: { badgeId: String(badge._id), sheetId: String(sheet._id), criteria: targetCriteria },
              });
              console.log(`    ✓ Awarded ${targetCriteria} badge!`);
              awarded++;
            }
          }
        }
      }
    }

    console.log(`\n=== Total badges awarded: ${awarded} ===`);
    res.json({ ok: true, awarded });
  } catch (err) {
    console.error('Auto-award error:', err);
    res.status(500).json({ error: 'Failed to auto-award badges', details: err.message });
  }
});

// Admin: Update badge
router.put('/:badgeId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { badgeId } = req.params;
    const { name, description, color, icon } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    
    const badge = await Badge.findByIdAndUpdate(badgeId, updateData, { new: true });
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({ ok: true, badge: { ...badge.toObject(), id: String(badge._id) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update badge' });
  }
});

// Admin: Delete badge
router.delete('/:badgeId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { badgeId } = req.params;
    await UserBadge.deleteMany({ badgeId });
    await Badge.deleteOne({ _id: badgeId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete badge' });
  }
});

export default router;
