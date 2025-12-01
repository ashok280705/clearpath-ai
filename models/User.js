import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  name: String,
  password: String,
  role: { type: String, enum: ['user', 'government'], default: 'user' },
  state: String,
  district: String,
  city: String,
  taluka: String,
  govId: String,
  rewardPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ state: 1, district: 1, city: 1, taluka: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
