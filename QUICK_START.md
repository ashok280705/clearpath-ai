# ClearPath AI - Quick Start Guide

## What's Been Created

### Frontend Pages
✅ **Login Page** (`/app/login.jsx`)
- User login with email/password
- Government login with ID/password
- Auto-creates user on first login
- Beautiful gradient UI

✅ **User Dashboard** (`/app/dashboard.jsx`)
- View reward points
- Report hotspots section
- Redeem rewards section
- Logout functionality

✅ **Government Portal** (`/app/gov-portal.jsx`)
- View all pollution hotspots
- Filter by status (Pending/Verified/Cleaned)
- Verify and mark hotspots as cleaned
- Statistics dashboard
- Garbage collection requests

### Backend Setup
✅ **Database Models** (`/app/auth.js`, `/app/models.js`)
- User model with roles (user/government)
- Hotspot model with detection results
- Reward and Product models
- Redemption tracking

✅ **MongoDB Connection** (`/app/mongo-connection.js`)
- Local MongoDB support
- Connection pooling

✅ **Authentication**
- JWT token-based auth
- Password hashing with bcryptjs
- Role-based access control

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Or Docker
docker run -d -p 27017:27017 mongo:latest
```

### 3. Create API Routes (Manual)
Copy the code from `MANUAL_SETUP.md` and create:
- `app/api/auth-login/route.js`
- `app/api/auth-gov-login/route.js`
- `app/api/auth-me/route.js`

### 4. Seed Government Users
```bash
# Create seed.mjs (see MANUAL_SETUP.md)
node seed.mjs
```

### 5. Run Dev Server
```bash
npm run dev
```

Visit: **http://localhost:3000/login**

## Test Credentials

### User
- Email: `test@example.com`
- Password: `password123`

### Government
- ID: `GOV-DELHI-001`
- Password: `admin123`

## File Structure

```
app/
├── page.jsx                 # Root (redirects to login/dashboard)
├── login.jsx                # Login page
├── dashboard.jsx            # User dashboard
├── gov-portal.jsx           # Government portal
├── auth.js                  # User model
├── models.js                # Hotspot, Reward models
├── mongo-connection.js      # DB connection
├── yolo-service.js          # Image detection
├── hotspot-form.jsx         # Hotspot form component
├── rewards-page.jsx         # Rewards component
├── gov-portal-page.jsx      # Gov portal component
├── api-auth-login-route.js  # Reference for API
├── api-auth-gov-login-route.js
└── api-auth-me-route.js
```

## Features Implemented

### Feature 1: Hotspot Reporting ✅
- Image upload/camera capture
- Geolocation capture
- YOLO detection (ready to integrate)
- Duplicate detection
- 100 points reward

### Feature 2: Reward Redemption ✅
- Points balance display
- Eco-friendly products
- One-click redemption
- Inventory management

### Feature 3: Garbage Requests (UI Ready)
- Request aggregation
- Threshold-based dispatch
- Real-time notifications

### Feature 4: AQI Alerts (UI Ready)
- Daily morning alerts
- Weather data
- Precautions

## Next Steps

1. **Create API routes** (see MANUAL_SETUP.md)
2. **Integrate YOLO** for image detection
3. **Add map integration** (Mapbox/Leaflet)
4. **Implement file upload** to cloud storage
5. **Add email notifications**
6. **Deploy to production**

## Troubleshooting

**Can't connect to MongoDB?**
```bash
mongosh  # Check if running
brew services start mongodb-community  # Start if not running
```

**API endpoints not working?**
- Make sure you created the `app/api/*/route.js` files
- Check `.env.local` has correct MongoDB URI

**Port 3000 in use?**
```bash
npm run dev -- -p 3001
```

## Support

See `MANUAL_SETUP.md` for detailed setup instructions.
See `FRONTEND_SETUP.md` for additional configuration.
