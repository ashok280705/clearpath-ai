import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reward from '@/models/Reward';

export async function GET() {
  try {
    await dbConnect();
    const rewards = await Reward.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ rewards });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
