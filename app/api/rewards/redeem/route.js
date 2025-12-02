import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reward from '@/models/Reward';
import Redemption from '@/models/Redemption';
import User from '@/models/User';

export async function POST(req) {
  try {
    await dbConnect();
    const { userId, rewardId } = await req.json();

    const user = await User.findById(userId);
    const reward = await Reward.findById(rewardId);

    if (!user || !reward) {
      return NextResponse.json({ error: 'User or reward not found' }, { status: 404 });
    }

    if (user.rewardPoints < reward.pointsRequired) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    if (reward.stock < 1) {
      return NextResponse.json({ error: 'Out of stock' }, { status: 400 });
    }

    user.rewardPoints -= reward.pointsRequired;
    reward.stock -= 1;

    await user.save();
    await reward.save();

    const redemption = await Redemption.create({
      userId,
      rewardId,
      pointsSpent: reward.pointsRequired
    });

    return NextResponse.json({ success: true, redemption, remainingPoints: user.rewardPoints });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
