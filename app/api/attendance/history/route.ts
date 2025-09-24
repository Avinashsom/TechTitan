import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { teacherId, classId, date } = await req.json();

    if (!teacherId || !classId || !date) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Find manual attendance only (teacher marked)
    const attendance = await Attendance.findOne({
      teacherId,
      classId,
      date,
      method: 'manual',
    }).populate('records.studentId', 'name rollNumber'); // populate student info

    if (!attendance) {
      return NextResponse.json({ message: 'No attendance found' }, { status: 404 });
    }

    return NextResponse.json(attendance);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
