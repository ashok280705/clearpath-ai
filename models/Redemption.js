import mongoose from 'mongoose';

const RedemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  pointsSpent: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'delivered', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.Redemption || mongoose.model('Redemption', RedemptionSchema);
