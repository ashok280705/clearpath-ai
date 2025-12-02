import mongoose from 'mongoose';

const RewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  stock: { type: Number, required: true },
  imageUrl: { type: String },
  category: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Reward || mongoose.model('Reward', RewardSchema);
