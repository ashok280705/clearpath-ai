import connectDB from '@/lib/db';
import GarbageRequest from '@/models/GarbageRequest';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const status = searchParams.get('status');

    let query = {};
    if (city) query.city = city;
    if (status && status !== 'all') query.status = status;

    const requests = await GarbageRequest.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return Response.json({ requests });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
