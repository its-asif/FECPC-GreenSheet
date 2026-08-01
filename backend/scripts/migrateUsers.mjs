import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined,
    });
    console.log('Connected to MongoDB');
    
    // Update users who don't have the 'batch' field
    const result = await User.updateMany(
      { batch: { $exists: false } },
      { $set: { batch: "" } }
    );
    console.log(`Updated ${result.modifiedCount} user documents with default batch.`);
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run();
