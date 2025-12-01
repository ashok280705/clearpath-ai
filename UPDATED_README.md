# 🌍 ClearPath AI - Updated with Google OAuth

## ✅ What Changed

### User Login Now Uses Google OAuth
- ✅ **User tab**: "Continue with Google" button
- ✅ **Government tab**: Still uses ID/password (unchanged)
- ✅ Auto-creates user account in MongoDB
- ✅ Session management with NextAuth

## 🚀 Quick Start

### 1. Setup Google OAuth (IMPORTANT!)

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

Quick version:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth credentials
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

### 2. Update .env.local

```env
MONGODB_URI=mongodb://localhost:27017/clearpath
NEXTAUTH_SECRET=run-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Install & Run

```bash
npm install
brew services start mongodb-community
node seed.mjs
npm run dev
```

Visit: **http://localhost:3000**

## 🔐 Login Methods

### User Login (Google OAuth)
1. Click "Continue with Google"
2. Sign in with Google account
3. Auto-redirects to `/dashboard`

### Government Login (ID/Password)
- ID: `GOV-DELHI-001`
- Password: `admin123`

## 📁 New Files Added

```
app/
├── api/auth/[...nextauth]/route.js  # NextAuth handler
├── providers.jsx                     # SessionProvider wrapper
└── layout.jsx                        # Updated with Providers

GOOGLE_OAUTH_SETUP.md                 # Setup instructions
```

## 🎯 Features

✅ Google OAuth for users
✅ Manual login for government
✅ Session management
✅ Auto-account creation
✅ MongoDB integration
✅ Role-based access

## 📚 Documentation

- **GOOGLE_OAUTH_SETUP.md** - Google OAuth setup
- **START_HERE.md** - Quick start
- **SETUP_GUIDE.md** - Detailed setup
- **PROJECT_SUMMARY.md** - Complete overview

## 🐛 Troubleshooting

**Google login not working?**
- Check Google Console redirect URIs
- Verify .env.local has correct credentials
- Make sure NEXTAUTH_SECRET is set

**Session not persisting?**
- Generate new NEXTAUTH_SECRET: `openssl rand -base64 32`
- Restart dev server

---

**Ready! Run `npm run dev` and test Google login** 🚀
