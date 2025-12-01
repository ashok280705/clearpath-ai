# ClearPath AI - Complete Setup Guide

## ✅ Folder Structure (Proper Next.js Routing)

```
clearpath-ai/
├── app/
│   ├── page.jsx                          # Root (redirects to /login)
│   ├── layout.jsx                        # Root layout
│   ├── globals.css                       # Global styles
│   ├── login/
│   │   └── page.jsx                      # /login route
│   ├── dashboard/
│   │   └── page.jsx                      # /dashboard route
│   ├── gov-portal/
│   │   └── page.jsx                      # /gov-portal route
│   └── api/
│       ├── auth/
│       │   ├── login/route.js            # POST /api/auth/login
│       │   └── gov-login/route.js        # POST /api/auth/gov-login
│       └── hotspots/
│           └── create/route.js           # POST /api/hotspots/create
├── lib/
│   └── db.js                             # MongoDB connection
├── models/
│   ├── User.js                           # User model
│   └── Hotspot.js                        # Hotspot model
├── seed.mjs                              # Seed government users
├── .env.local                            # Environment variables
└── package.json
```

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start MongoDB
```bash
# Option 1: Homebrew (macOS)
brew services start mongodb-community

# Option 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option 3: Check if already running
mongosh
```

### Step 3: Seed Government Users
```bash
node seed.mjs
```

Expected output:
```
✓ Connected to MongoDB
✓ Created Delhi Admin
✓ Created Mumbai Admin
✓ Created Bangalore Admin

✓ Government users seeded successfully!

Login credentials:
- GOV-DELHI-001 / admin123
- GOV-MUMBAI-001 / admin123
- GOV-BANGALORE-001 / admin123
```

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Open Browser
Visit: **http://localhost:3000**

## 🔐 Login Credentials

### User Login
- Email: `test@example.com`
- Password: `password123`
- (Auto-creates account on first login)

### Government Login
- **Delhi**: `GOV-DELHI-001` / `admin123`
- **Mumbai**: `GOV-MUMBAI-001` / `admin123`
- **Bangalore**: `GOV-BANGALORE-001` / `admin123`

## 📱 Available Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Root (redirects to login) | Public |
| `/login` | Login page (User & Gov) | Public |
| `/dashboard` | User dashboard | User only |
| `/gov-portal` | Government portal | Government only |

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/gov-login` | POST | Government login |
| `/api/hotspots/create` | POST | Create hotspot |

## 🎨 Features

### User Dashboard (`/dashboard`)
- ✅ View reward points
- ✅ Report pollution hotspots
- ✅ Redeem rewards
- ✅ Track impact

### Government Portal (`/gov-portal`)
- ✅ View all hotspots
- ✅ Filter by status
- ✅ Verify hotspots
- ✅ Mark as cleaned
- ✅ View statistics
- ✅ Garbage collection requests

## 🛠️ Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not running, start it
brew services start mongodb-community

# Or restart
brew services restart mongodb-community
```

### Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "16.0.6",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3"
  }
}
```

## 🎯 Next Steps

1. ✅ Basic authentication - DONE
2. ✅ User dashboard - DONE
3. ✅ Government portal - DONE
4. 🔄 Implement image upload
5. 🔄 Integrate YOLO detection
6. 🔄 Add map integration
7. 🔄 Implement rewards system
8. 🔄 Add garbage collection feature
9. 🔄 Add AQI alerts

## 📝 Notes

- MongoDB runs locally on `localhost:27017`
- Database name: `clearpath`
- User passwords are hashed with bcryptjs
- Government users must be seeded before login
- User accounts auto-create on first login
