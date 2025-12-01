# Hotspot Feature Setup Guide

## ✅ What's Implemented

### User Flow:
1. User uploads/captures geotagged photo
2. Location automatically captured (or manual input)
3. Hotspot submitted to database (status: pending)
4. Sent to government portal for that region

### Government Flow:
1. View all pending hotspots in their region
2. Click "Verify with YOLO" button
3. System sends image to YOLO ML service
4. YOLO detects pollutants and returns results
5. Hotspot marked as "verified" with detection data
6. User automatically awarded 100 points
7. View all hotspots on Google Maps with pins

## 🔧 Setup Steps

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps JavaScript API"
3. Create API key
4. Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

### 2. Start ML Service

```bash
cd ml-service
source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Next.js

```bash
npm run dev
```

## 📱 How to Test

### Test User Submission:
1. Go to http://localhost:3000/hotspots
2. Sign in with Google
3. Click "Take Photo" or "Select Image"
4. Allow location access (or enter manually)
5. Click "Submit Hotspot"
6. Check success message

### Test Government Verification:
1. Go to http://localhost:3000/login
2. Switch to "Government" tab
3. Login with: `GOV-DELHI-001` / `admin123`
4. Go to Government Portal
5. See pending hotspots
6. Click "Verify with YOLO"
7. Wait for YOLO detection
8. See detection results and status change to "verified"
9. Click "Map View" to see all hotspots on Google Maps

## 🗺️ Map Features

- **Dark theme** matching app design
- **Color-coded pins**:
  - 🟡 Yellow = Pending
  - 🟢 Green = Verified
  - ⚪ Gray = Cleaned
- **Click pins** to see hotspot details
- **Auto-zoom** to fit all markers
- **Info windows** with image preview

## 📂 Files Created

```
app/
├── api/
│   ├── ml/proxy-detect/route.js       # ML proxy
│   └── hotspots/
│       ├── create/route.js            # Submit hotspot
│       ├── list/route.js              # List hotspots
│       └── verify/route.js            # YOLO verification
├── components/
│   ├── GoogleMap.jsx                  # Map component
│   ├── SignInButton.jsx               # Auth button
│   └── HotspotCard.jsx                # Hotspot card
├── hotspots/
│   ├── page.jsx                       # Hotspots page
│   └── components/
│       └── UploadForm.jsx             # Upload form
└── gov-portal/page.jsx                # Updated with map

lib/clientUtils.js                     # Client utilities
public/uploads/                        # Image storage
```

## 🔄 Complete Flow

1. **User submits hotspot** → Saved as "pending"
2. **Government sees in portal** → Filtered by region
3. **Government clicks verify** → Sends to YOLO
4. **YOLO detects pollutants** → Returns detection data
5. **System updates hotspot** → Status: "verified"
6. **User gets 100 points** → Reward awarded
7. **Appears on map** → Green pin with details

## 🎯 API Endpoints

- `POST /api/ml/proxy-detect` - Proxy to YOLO service
- `POST /api/hotspots/create` - Submit new hotspot
- `GET /api/hotspots/list?status=pending` - List hotspots
- `POST /api/hotspots/verify` - Verify with YOLO + award points

## 🐛 Troubleshooting

**Submit button not working?**
- Make sure you're signed in with Google
- Check location is captured
- Check browser console for errors

**YOLO verification fails?**
- Ensure ML service is running on port 8000
- Check image file exists in `public/uploads/`
- Verify YOLO model is loaded

**Map not showing?**
- Add Google Maps API key to `.env.local`
- Restart Next.js server
- Check browser console for API errors

**No hotspots showing?**
- Check MongoDB is running
- Verify hotspots exist in database
- Check API response in Network tab

## 🚀 Ready to Test!

1. Start MongoDB: `brew services start mongodb-community`
2. Start ML service: `cd ml-service && uvicorn app:app --port 8000`
3. Start Next.js: `npm run dev`
4. Visit: http://localhost:3000/hotspots
