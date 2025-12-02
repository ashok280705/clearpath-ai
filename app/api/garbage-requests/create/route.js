import connectDB from '@/lib/db';
import GarbageRequest from '@/models/GarbageRequest';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const { userId, eventType, description, latitude, longitude, address, city, state, district } = await req.json();

    const request = new GarbageRequest({
      userId,
      eventType,
      description,
      latitude,
      longitude,
      address,
      city,
      state,
      district,
      status: 'pending'
    });

    await request.save();
    
    await User.findByIdAndUpdate(userId, { $inc: { rewardPoints: 30 } });

    return Response.json({ success: true, message: 'Request submitted! +30 points', request });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
