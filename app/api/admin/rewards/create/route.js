import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reward from '@/models/Reward';

export async function POST(req) {
  try {
    await dbConnect();
    const { name, description, pointsRequired, stock, imageUrl, category } = await req.json();

    const reward = await Reward.create({
      name,
      description,
      pointsRequired,
      stock,
      imageUrl,
      category
    });

    return NextResponse.json({ success: true, reward });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
