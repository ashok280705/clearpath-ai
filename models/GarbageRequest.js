import mongoose from 'mongoose';

const garbageRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true },
  description: String,
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String,
  city: String,
  state: String,
  district: String,
  status: { type: String, enum: ['pending', 'approved', 'completed'], default: 'pending' },
  rewardAwarded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

garbageRequestSchema.index({ city: 1 });

export default mongoose.models.GarbageRequest || mongoose.model('GarbageRequest', garbageRequestSchema);
