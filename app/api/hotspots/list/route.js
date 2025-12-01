import connectDB from '@/lib/db';
import Hotspot from '@/models/Hotspot';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (city) query.city = city;
    
    console.log('Fetching hotspots with query:', query);
    
    const hotspots = await Hotspot.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log(`Found ${hotspots.length} hotspots`);

    return Response.json({ hotspots });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
