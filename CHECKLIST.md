# ✅ ClearPath AI - Setup Checklist

## Before You Start

- [ ] Node.js installed (v18+)
- [ ] MongoDB installed locally
- [ ] Code editor ready (VS Code recommended)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```
- [ ] No errors during installation
- [ ] `node_modules/` folder created

### 2. Start MongoDB
```bash
brew services start mongodb-community
```
- [ ] MongoDB service started
- [ ] Can connect with `mongosh`

### 3. Seed Government Users
```bash
node seed.mjs
```
- [ ] See "✓ Government users seeded successfully!"
- [ ] Three government accounts created

### 4. Run Development Server
```bash
npm run dev
```
- [ ] Server starts on http://localhost:3000
- [ ] No compilation errors

### 5. Test Login Page
- [ ] Visit http://localhost:3000
- [ ] Redirects to /login
- [ ] See login form with User/Government tabs

### 6. Test User Login
- [ ] Enter email: `test@example.com`
- [ ] Enter password: `password123`
- [ ] Click Login
- [ ] Redirects to /dashboard
- [ ] See reward points (0)

### 7. Test Government Login
- [ ] Go back to /login
- [ ] Switch to Government tab
- [ ] Enter ID: `GOV-DELHI-001`
- [ ] Enter password: `admin123`
- [ ] Click Login
- [ ] Redirects to /gov-portal
- [ ] See "Region: Delhi"

### 8. Test Dashboard Features
- [ ] Click "Report Hotspot" tab
- [ ] See upload form
- [ ] Click "My Rewards" tab
- [ ] See product cards

### 9. Test Government Portal
- [ ] See hotspots list
- [ ] Click "Statistics" tab
- [ ] See stats cards
- [ ] Click "Garbage Requests" tab
- [ ] See request list

### 10. Test Logout
- [ ] Click Logout button
- [ ] Redirects to /login
- [ ] Can login again

## Troubleshooting

### MongoDB won't start
```bash
brew services restart mongodb-community
# or
mongosh  # Check if already running
```

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

### Module not found errors
```bash
rm -rf node_modules package-lock.json .next
npm install
```

### Can't login as government
```bash
# Re-run seed script
node seed.mjs
```

## File Structure Verification

Check these folders exist:
- [ ] `app/login/page.jsx`
- [ ] `app/dashboard/page.jsx`
- [ ] `app/gov-portal/page.jsx`
- [ ] `app/api/auth/login/route.js`
- [ ] `app/api/auth/gov-login/route.js`
- [ ] `lib/db.js`
- [ ] `models/User.js`
- [ ] `models/Hotspot.js`

## Next Development Tasks

- [ ] Add image upload functionality
- [ ] Integrate YOLO detection API
- [ ] Add map integration (Leaflet/Mapbox)
- [ ] Create product catalog
- [ ] Implement reward redemption
- [ ] Add garbage collection requests
- [ ] Implement AQI alerts
- [ ] Add email notifications
- [ ] Deploy to production

## Success Criteria

✅ All checkboxes above are checked
✅ Can login as both user and government
✅ Dashboard displays correctly
✅ Government portal displays correctly
✅ No console errors
✅ MongoDB connection working

---

**If all checks pass, you're ready to develop! 🚀**
