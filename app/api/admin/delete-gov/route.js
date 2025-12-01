import connectDB from '@/lib/db';
import GovernmentBody from '@/models/GovernmentBody';

export async function POST(req) {
  try {
    await connectDB();
    const { id } = await req.json();

    await GovernmentBody.findByIdAndDelete(id);

    return Response.json({
      success: true,
      message: 'Government user deleted successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
