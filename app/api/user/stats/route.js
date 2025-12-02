import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Hotspot from '@/models/Hotspot';
import GarbageRequest from '@/models/GarbageRequest';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ hotspots: 0, requests: 0, verified: 0, cleaned: 0 });
    }

    const hotspots = await Hotspot.countDocuments({ userId: user._id });
    const verified = await Hotspot.countDocuments({ userId: user._id, status: 'verified' });
    const cleaned = await Hotspot.countDocuments({ userId: user._id, status: 'cleaned' });
    const requests = await GarbageRequest.countDocuments({ userId: user._id });

    return NextResponse.json({ hotspots, requests, verified, cleaned });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
