# ClearPath AI - Setup Guide

## Project Structure

```
app/
├── auth.js                    # User model
├── models.js                  # Hotspot, Reward, Product models
├── mongo-connection.js        # MongoDB connection
├── yolo-service.js            # Image detection service
├── hotspot-form.jsx           # Hotspot reporting component
├── rewards-page.jsx           # Rewards redemption component
├── gov-portal-page.jsx        # Government portal component
├── api-hotspots-create.js     # API: Create hotspot
└── api-rewards-redeem.js      # API: Redeem rewards
```

## Installation

```bash
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in required values:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/clearpath
NEXTAUTH_SECRET=generate-random-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
YOLO_API_URL=http://localhost:5000
MAPBOX_TOKEN=your-mapbox-token
```

## Database Setup

1. Create MongoDB cluster at mongodb.com
2. Get connection string
3. Add to `.env.local`

## YOLO Setup (Image Detection)

### Option 1: Local YOLO Server
```bash
pip install ultralytics opencv-python flask
```

Create `yolo-server.py`:
```python
from flask import Flask, request, jsonify
from ultralytics import YOLO

app = Flask(__name__)
model = YOLO('yolov8n.pt')

@app.route('/detect', methods=['POST'])
def detect():
    file = request.files['image']
    results = model(file)
    return jsonify({
        'class': results[0].names[int(results[0].boxes.cls[0])],
        'confidence': float(results[0].boxes.conf[0]),
        'detections': len(results[0].boxes)
    })

if __name__ == '__main__':
    app.run(port=5000)
```

Run: `python yolo-server.py`

### Option 2: Cloud API
Use Roboflow or similar service and update `YOLO_API_URL`

## Features Implemented

### Feature 1: Hotspot Reporting
- Users upload/capture pollution images
- Automatic geolocation capture
- YOLO detects pollutant type & severity
- Duplicate detection via image hash
- 100 points awarded for new hotspots
- Government notified automatically

### Feature 2: Reward Redemption
- Users view reward balance
- Browse eco-friendly products (bags, clothing, etc.)
- Redeem points for products
- Automatic inventory management

## API Endpoints

### Hotspots
- `POST /api/hotspots/create` - Report new hotspot
- `GET /api/hotspots/list` - List hotspots by region/status
- `POST /api/hotspots/verify` - Update hotspot status (gov only)

### Rewards
- `GET /api/rewards/balance` - Get user points
- `POST /api/rewards/redeem` - Redeem product
- `GET /api/rewards/products` - List available products

## Authentication

### User Login (Google OAuth)
- Automatic profile creation
- Email verification
- Reward points tracking

### Government Login
- Manual ID + Password
- Region assignment
- Portal access

## Running the Project

```bash
npm run dev
```

Visit: http://localhost:3000

## Next Steps (Features 3 & 4)

### Feature 3: Garbage Collection Requests
- Users request garbage pickup
- Aggregate requests by location
- Trigger van dispatch at threshold (50-100 requests)
- Real-time notifications

### Feature 4: Daily AQI Alerts
- Fetch AQI data from OpenWeatherMap API
- Daily morning alerts with precautions
- Weather data for government portal
- Personalized recommendations

## Design Notes

- Clean, minimalist UI (inspired by modern design)
- Mobile-first responsive design
- Tailwind CSS for styling
- Real-time geolocation
- Progressive image loading
- Accessibility compliant

## Troubleshooting

**YOLO not connecting:**
- Ensure YOLO server running on port 5000
- Check `YOLO_API_URL` in `.env.local`

**MongoDB connection error:**
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Ensure network access enabled

**Google OAuth not working:**
- Verify Client ID/Secret
- Add `http://localhost:3000` to authorized redirect URIs
