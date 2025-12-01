import connectDB from '@/lib/db';
import Hotspot from '@/models/Hotspot';
import User from '@/models/User';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    await connectDB();
    const { hotspotId } = await req.json();

    const hotspot = await Hotspot.findById(hotspotId);
    if (!hotspot) {
      return Response.json({ error: 'Hotspot not found' }, { status: 404 });
    }

    // Read image and send to YOLO
    const imagePath = path.join(process.cwd(), 'public', hotspot.imageUrl);
    const imageBuffer = await readFile(imagePath);
    const blob = new Blob([imageBuffer]);
    
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg');
    formData.append('lat', hotspot.latitude);
    formData.append('lon', hotspot.longitude);

    const mlResponse = await fetch('http://localhost:8000/detect', {
      method: 'POST',
      body: formData,
    });

    if (!mlResponse.ok) {
      throw new Error('ML detection failed');
    }

    const mlData = await mlResponse.json();
    
    if (!mlData.detections || mlData.detections.length === 0) {
      hotspot.status = 'rejected';
      hotspot.rejectionReason = 'No garbage detected in image';
      await hotspot.save();
      
      return Response.json({
        success: false,
        error: 'No garbage detected in image',
        message: 'Hotspot rejected - no pollution found',
        detections: []
      });
    }
    
    // Update hotspot with detection results
    hotspot.detectionResult = {
      pollutantType: mlData.detections[0].label,
      confidence: mlData.detections[0].confidence,
      severity: mlData.detections[0].confidence > 0.7 ? 'high' : mlData.detections[0].confidence > 0.4 ? 'medium' : 'low'
    };
    hotspot.status = 'verified';
    hotspot.rewardAwarded = true;
    await hotspot.save();

    // Award points to user
    await User.findByIdAndUpdate(hotspot.userId, { $inc: { rewardPoints: 100 } });

    return Response.json({
      success: true,
      message: 'Hotspot verified successfully',
      hotspot,
      detections: mlData.detections
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
