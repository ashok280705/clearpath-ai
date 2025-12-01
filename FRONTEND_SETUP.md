# ClearPath AI - Frontend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB Locally
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Seed Government Users
```bash
node --require @babel/register app/seed-gov.js
```

Or use this simpler approach - create `seed.mjs`:
```bash
cat > seed.mjs << 'EOF'
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  name: String,
  role: { type: String, enum: ['user', 'government'], default: 'user' },
  region: String,
  govId: String,
  password: String,
  rewardPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedGov() {
  await mongoose.connect('mongodb://localhost:27017/clearpath');
  
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
  }

  console.log('✓ Government users seeded');
  process.exit(0);
}

seedGov();
EOF

node seed.mjs
```

### 4. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000/login

## Login Credentials

### User Login
- Email: `test@example.com`
- Password: `password123`
(Auto-creates on first login)

### Government Login
- **Delhi**: GOV-DELHI-001 / admin123
- **Mumbai**: GOV-MUMBAI-001 / admin123
- **Bangalore**: GOV-BANGALORE-001 / admin123

## File Structure

```
app/
├── page.jsx              # Root redirect
├── login.jsx             # Login page (both user & gov)
├── dashboard.jsx         # User dashboard
├── gov-portal.jsx        # Government portal
├── auth.js               # User model
├── models.js             # Hotspot, Reward models
├── mongo-connection.js   # DB connection
├── yolo-service.js       # Image detection
├── hotspot-form.jsx      # Hotspot form component
├── rewards-page.jsx      # Rewards component
├── gov-portal-page.jsx   # Gov portal component
├── api-auth-login.js     # User login API
├── api-auth-gov-login.js # Gov login API
├── api-auth-me.js        # Auth check API
├── api-hotspots-create.js
├── api-rewards-redeem.js
└── seed-gov.js           # Seed script
```

## Features

### User Dashboard
- View reward points
- Report pollution hotspots
- Redeem rewards for eco-products
- Track impact

### Government Portal
- View all reported hotspots
- Filter by status (Pending/Verified/Cleaned)
- Verify and mark hotspots as cleaned
- View statistics
- Manage garbage collection requests

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/gov-login` - Government login
- `GET /api/auth/me` - Check auth status

### Hotspots
- `POST /api/hotspots/create` - Report hotspot
- `GET /api/hotspots/list` - List hotspots
- `POST /api/hotspots/verify` - Update status

### Rewards
- `GET /api/rewards/balance` - Get points
- `POST /api/rewards/redeem` - Redeem product
- `GET /api/rewards/products` - List products

## Troubleshooting

**MongoDB connection error:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it
brew services start mongodb-community
```

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
```

**Clear cache and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Implement actual hotspot image upload
2. Integrate YOLO detection API
3. Add map integration (Mapbox/Leaflet)
4. Implement garbage request feature
5. Add AQI alerts
6. Deploy to production
