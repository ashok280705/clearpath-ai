# ClearPath AI - Manual Setup Instructions

## Step 1: Create API Routes Directory Structure

Since the file system has limitations, manually create these directories and files:

### Create directories:
```bash
mkdir -p app/api/auth-login
mkdir -p app/api/auth-gov-login
mkdir -p app/api/auth-me
mkdir -p app/api/hotspots
mkdir -p app/api/rewards
```

### Create `app/api/auth-login/route.js`:
```javascript
import connectDB from '@/app/mongo-connection';
import { User } from '@/app/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await connectDB();
    const { email, password, role } = await req.json();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name: email.split('@')[0],
        role,
        rewardPoints: 0
      });
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    } else {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    );

    return Response.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        rewardPoints: user.rewardPoints
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Create `app/api/auth-gov-login/route.js`:
```javascript
import connectDB from '@/app/mongo-connection';
import { User } from '@/app/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await connectDB();
    const { govId, password } = await req.json();

    const user = await User.findOne({ govId, role: 'government' });

    if (!user) {
      return Response.json({ error: 'Invalid government ID' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, role: 'government' },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    );

    return Response.json({
      token,
      user: {
        _id: user._id,
        govId: user.govId,
        name: user.name,
        role: 'government',
        region: user.region
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Create `app/api/auth-me/route.js`:
```javascript
import jwt from 'jsonwebtoken';
import connectDB from '@/app/mongo-connection';
import { User } from '@/app/auth';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return Response.json({ error: 'No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    await connectDB();
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        rewardPoints: user.rewardPoints
      }
    });
  } catch (error) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Start MongoDB

```bash
# Option 1: Using Homebrew (macOS)
brew services start mongodb-community

# Option 2: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option 3: Download from mongodb.com and run manually
```

## Step 4: Seed Government Users

Create `seed.mjs` in project root:

```javascript
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
  try {
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

    console.log('✓ Government users seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedGov();
```

Run: `node seed.mjs`

## Step 5: Run Development Server

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

## Pages Available

- `/login` - Login page (user & government)
- `/dashboard` - User dashboard
- `/gov-portal` - Government portal

## Troubleshooting

**MongoDB connection refused:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it
brew services start mongodb-community
```

**Port 3000 in use:**
```bash
npm run dev -- -p 3001
```

**Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

**Module not found errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```
