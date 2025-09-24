import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import dbConnect from '@/lib/db';
import User from '@/models/User'; // adjust path as needed

export async function POST(req: NextRequest) {
  await dbConnect();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  // Generate JWT token
  const token = sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET!, // ensure you use "!" here
    { expiresIn: '1d' }
  );

  // Serialize cookie
  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  // Send response with cookie
  const response = NextResponse.json({ message: 'Login successful' });

  response.headers.set('Set-Cookie', cookie);

  return response;
}
