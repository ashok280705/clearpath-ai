# 🌍 ClearPath AI

**Report air pollution hotspots, earn rewards, and help clean the environment.**

A Next.js application with user and government portals for managing pollution hotspots, rewards, and garbage collection requests.

## ✨ Features

- 🔐 **Dual Authentication** - User (email/password) & Government (ID/password)
- 📊 **User Dashboard** - Report hotspots, track rewards, redeem products
- 🏛️ **Government Portal** - Verify hotspots, view statistics, manage requests
- 🗄️ **MongoDB Integration** - Local database with Mongoose ODM
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 📁 **Proper Routing** - Next.js 14 App Router with folder-based structure

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB
brew services start mongodb-community

# 3. Seed government users
node seed.mjs

# 4. Run development server
npm run dev
```

Visit: **http://localhost:3000**

## 🔑 Test Credentials

**User Login:**
- Email: `test@example.com`
- Password: `password123`

**Government Login:**
- ID: `GOV-DELHI-001`
- Password: `admin123`

## 📂 Project Structure

```
app/
├── login/page.jsx          # Login page (/login)
├── dashboard/page.jsx      # User dashboard (/dashboard)
├── gov-portal/page.jsx     # Government portal (/gov-portal)
└── api/
    ├── auth/login/route.js
    ├── auth/gov-login/route.js
    └── hotspots/create/route.js

lib/db.js                   # MongoDB connection
models/User.js              # User model
models/Hotspot.js           # Hotspot model
seed.mjs                    # Seed script
```

## 📱 Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Root (redirects to login) | Public |
| `/login` | Login page | Public |
| `/dashboard` | User dashboard | User only |
| `/gov-portal` | Government portal | Government only |

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB (local)
- **ODM:** Mongoose
- **Styling:** Tailwind CSS
- **Auth:** bcryptjs

## 📚 Documentation

- **START_HERE.md** - Quick start guide
- **SETUP_GUIDE.md** - Detailed setup instructions
- **PROJECT_SUMMARY.md** - Complete project overview
- **CHECKLIST.md** - Setup verification checklist

## 🎯 Next Steps

1. Add image upload functionality
2. Integrate YOLO detection API
3. Add map integration (Leaflet/Mapbox)
4. Implement reward redemption system
5. Add garbage collection requests
6. Implement AQI alerts

## 🐛 Troubleshooting

**MongoDB connection error:**
```bash
mongosh  # Check if running
brew services start mongodb-community
```

**Port 3000 in use:**
```bash
npm run dev -- -p 3001
```

**Clear cache:**
```bash
rm -rf .next node_modules
npm install
```

## 📄 License

MIT
