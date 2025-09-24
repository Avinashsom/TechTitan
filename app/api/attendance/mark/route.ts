import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import AttendanceCode from "@/models/AttendanceCode"; // ✅ fixed import
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  await dbConnect();

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only students can mark attendance
  if (user.role !== "student") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ message: "Code is required" }, { status: 400 });
  }

  const now = new Date();

  // Find valid attendance code
  const validCode = await AttendanceCode.findOne({
    code,
    expiresAt: { $gt: now },
  });

  if (!validCode) {
    return NextResponse.json({ message: "Invalid or expired code" }, { status: 400 });
  }

  // Check if student already marked attendance
  const alreadyMarked = await Attendance.findOne({
    studentId: user.id,
    classId: validCode.classId,
    date: validCode.date,
  });

  if (alreadyMarked) {
    return NextResponse.json({ message: "Already marked" }, { status: 409 });
  }

  // Create attendance record
  await Attendance.create({
    studentId: user.id,
    classId: validCode.classId,
    date: validCode.date,
    method: "code",
    status: "Present",
  });

  return NextResponse.json({ message: "✅ Attendance marked successfully" });
}
