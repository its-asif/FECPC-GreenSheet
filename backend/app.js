import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectMongo } from './utils/mongo.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import sheetsRoutes from './routes/sheets.js';
import progressRoutes from './routes/progress.js';
import leaderboardRoutes from './routes/leaderboard.js';
import badgeRoutes from './routes/badges.js';
import activityRoutes from './routes/activity.js';
import profileRoutes from './routes/profile.js';

// Load env and DB connection for both local and serverless
dotenv.config();
connectMongo();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Ensure DB is connected before handling any API route
app.use(async (req, res, next) => {
  try {
    await connectMongo();
  } catch (err) {
    return res.status(500).json({ error: 'Database connection failed' });
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/profile', profileRoutes);

export default app;
