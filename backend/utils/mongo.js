import mongoose from 'mongoose';

let connectPromise = null;
mongoose.set('bufferCommands', false);

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[mongo] MONGODB_URI not set – database operations will fail.');
    return;
  }
  if (mongoose.connection.readyState === 1) return;
  if (!connectPromise) {
    connectPromise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 5,
    }).then(() => {
      console.log('[mongo] Connected');
      return mongoose.connection;
    }).catch((err) => {
      console.error('[mongo] Connection error:', err.message);
      // reset so next request can retry
      connectPromise = null;
      throw err;
    });
  }
  return connectPromise;
}
