import mongoose from 'mongoose';

const hotspotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String,
  state: String,
  district: String,
  city: String,
  taluka: String,
  village: String,
  imageUrl: String,
  imageHash: String,
  detectionResult: {
    pollutantType: String,
    confidence: Number,
    severity: { type: String, enum: ['low', 'medium', 'high'] }
  },
  isDuplicate: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'verified', 'rejected', 'cleaned'], default: 'pending' },
  rejectionReason: String,
  rewardAwarded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

hotspotSchema.index({ state: 1, district: 1, city: 1, taluka: 1 });

if (mongoose.models.Hotspot) {
  delete mongoose.models.Hotspot;
}

export default mongoose.model('Hotspot', hotspotSchema);
