import connectDB from '@/lib/db';
import GovernmentBody from '@/models/GovernmentBody';

export async function GET() {
  try {
    await connectDB();
    const users = await GovernmentBody.find().select('-password');

    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
