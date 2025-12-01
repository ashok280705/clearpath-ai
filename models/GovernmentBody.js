import mongoose from 'mongoose';

const governmentBodySchema = new mongoose.Schema({
  govId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  district: String,
  taluka: String,
  createdAt: { type: Date, default: Date.now }
});

governmentBodySchema.index({ city: 1 });

export default mongoose.models.GovernmentBody || mongoose.model('GovernmentBody', governmentBodySchema);
