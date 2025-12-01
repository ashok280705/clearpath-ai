import connectDB from '@/lib/db';
import Hotspot from '@/models/Hotspot';
import User from '@/models/User';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    console.log('API: Hotspot create called');
    await connectDB();
    
    const formData = await req.formData();
    const image = formData.get('image');
    const userId = formData.get('userId');
    const latitude = parseFloat(formData.get('latitude'));
    const longitude = parseFloat(formData.get('longitude'));
    const address = formData.get('address');

    console.log('API: Received data', { userId, latitude, longitude, hasImage: !!image });

    if (!userId || !latitude || !longitude) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let imageUrl = '';
    if (image) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
        await writeFile(filepath, buffer);
        imageUrl = `/uploads/${filename}`;
        console.log('API: Image saved', imageUrl);
      } catch (err) {
        console.error('API: Image save error', err);
        return Response.json({ error: 'Failed to save image' }, { status: 500 });
      }
    }

    const state = formData.get('state') || '';
    const district = formData.get('district') || '';
    const city = formData.get('city') || '';
    const taluka = formData.get('taluka') || '';
    const village = formData.get('village') || '';

    const hotspot = new Hotspot({
      userId,
      latitude,
      longitude,
      address,
      imageUrl,
      state,
      district,
      city,
      taluka,
      village,
      status: 'pending'
    });

    await hotspot.save();
    console.log('API: Hotspot saved', hotspot._id);

    return Response.json({
      success: true,
      message: 'Hotspot submitted successfully! Awaiting verification.',
      hotspot
    });
  } catch (error) {
    console.error('API: Error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
