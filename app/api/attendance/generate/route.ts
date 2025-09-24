import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AttendanceCode from '@/models/AttendanceCode';
import { generateRandomCode } from '@/lib/generateCode';
import { Types } from 'mongoose';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { classId } = body;

    if (!classId) {
      return NextResponse.json({ message: 'Missing classId' }, { status: 400 });
    }

    // Validate classId is a valid ObjectId string
    if (!Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ message: 'Invalid classId' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = generateRandomCode(6);
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    // Set current date (yyyy-mm-dd)
    const date = new Date().toISOString().split('T')[0];

    // Create new attendance code document
    const newCode = await AttendanceCode.create({
      classId,
      code,
      expiresAt,
      date, // add date here if your schema requires it
    });

    return NextResponse.json({
      code: newCode.code,
      expiresAt: newCode.expiresAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error generating code' }, { status: 500 });
  }
}
