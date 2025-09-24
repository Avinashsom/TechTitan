import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

// GET /api/students/:id/attendance?classId=...&subject=...
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = await params; // studentId

    const url = new URL(req.url);
    const classId = url.searchParams.get('classId');
    const subject = url.searchParams.get('subject');

    // Build the query
    const query: any = { 'records.studentId': id };
    if (classId) query.classId = classId;
    if (subject) query.subject = subject;

    const attendanceEntries = await Attendance.find(query)
      .populate('teacherId', 'name email')
      .sort({ date: -1 }); // sort by date descending

    // Map to only include this student's record
    const studentAttendance = attendanceEntries.map((entry: any) => {
      const record = entry.records.find(
        (r: any) => r.studentId.toString() === id
      );
      return {
        subject: entry.subject,
        status: record?.status || 'N/A',
        date: entry.date,
        teacher: entry.teacherId?.name || 'Unknown',
        teacherEmail: entry.teacherId?.email || '',
        classId: entry.classId,
      };
    });

    return NextResponse.json(studentAttendance, { status: 200 });
  } catch (err: any) {
    console.error('Error fetching student attendance:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}
