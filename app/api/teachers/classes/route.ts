import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Class from '@/models/Class';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // adjust path as needed

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const teacherId = session.user.id;

    const classes = await Class.find({ teacherId }).select('_id name subject');

    return NextResponse.json(classes);
  } catch (err) {
    console.error('Error fetching classes:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
