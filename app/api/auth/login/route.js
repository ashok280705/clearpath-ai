import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        email,
        name: email.split('@')[0],
        password: hashedPassword,
        role: 'user',
        rewardPoints: 0
      });
      await user.save();
    } else {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    return Response.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        rewardPoints: user.rewardPoints
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
