import mongoose from 'mongoose';

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[mongo] MONGODB_URI not set – database operations will fail.');
    return;
  }
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
    console.log('[mongo] Connected');
  } catch (err) {
    console.error('[mongo] Connection error:', err.message);
  }
}
