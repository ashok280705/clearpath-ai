import connectDB from '@/lib/db';
import GovernmentBody from '@/models/GovernmentBody';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const { govId, name, state, district, city, taluka, password } = await req.json();

    const existing = await GovernmentBody.findOne({ govId });
    if (existing) {
      return Response.json({ error: 'Government ID already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const govBody = new GovernmentBody({
      govId,
      name,
      state,
      district,
      city,
      taluka,
      password: hashedPassword
    });

    await govBody.save();

    return Response.json({
      success: true,
      message: 'Government user created successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
