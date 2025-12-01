import connectDB from '@/lib/db';
import GovernmentBody from '@/models/GovernmentBody';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const { govId, password } = await req.json();

    const govBody = await GovernmentBody.findOne({ govId });

    if (!govBody) {
      return Response.json({ error: 'Invalid government ID' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, govBody.password);
    if (!isValid) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    return Response.json({
      user: {
        _id: govBody._id,
        govId: govBody.govId,
        name: govBody.name,
        role: 'government',
        city: govBody.city
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
