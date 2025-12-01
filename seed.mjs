import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  name: String,
  password: String,
  role: { type: String, enum: ['user', 'government'], default: 'user' },
  region: String,
  govId: String,
  rewardPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/clearpath');
    console.log('✓ Connected to MongoDB');
    
    const govUsers = [
      { govId: 'GOV-DELHI-001', name: 'Delhi Admin', region: 'Delhi', password: 'admin123' },
      { govId: 'GOV-MUMBAI-001', name: 'Mumbai Admin', region: 'Mumbai', password: 'admin123' },
      { govId: 'GOV-BANGALORE-001', name: 'Bangalore Admin', region: 'Bangalore', password: 'admin123' }
    ];

    for (const gov of govUsers) {
      const hashedPassword = await bcrypt.hash(gov.password, 10);
      await User.updateOne(
        { govId: gov.govId },
        { $set: { ...gov, password: hashedPassword, role: 'government' } },
        { upsert: true }
      );
      console.log(`✓ Created ${gov.name}`);
    }

    console.log('\n✓ Government users seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('- GOV-DELHI-001 / admin123');
    console.log('- GOV-MUMBAI-001 / admin123');
    console.log('- GOV-BANGALORE-001 / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
