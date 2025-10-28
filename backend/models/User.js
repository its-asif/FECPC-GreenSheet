import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, unique: true, index: true },
  email: { type: String, index: true },
  fullName: String,
  department: String,
  registrationNumber: String,
  phoneNumber: String,
  approved: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
