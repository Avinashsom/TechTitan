import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import AttendanceCode from "@/models/AttendanceCode";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  await dbConnect();

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "student") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ message: "Code is required" }, { status: 400 });
  }

  const now = new Date();

  // Normalize today's date (midnight) for consistent queries
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Find valid, unexpired attendance code
    const validCode = await AttendanceCode.findOne({
      code,
      expiresAt: { $gt: now },
      date: today,
    });

    if (!validCode) {
      return NextResponse.json({ message: "Invalid or expired code" }, { status: 400 });
    }

    const studentId = new mongoose.Types.ObjectId(user.id);
    const classId = new mongoose.Types.ObjectId(validCode.classId);

    // Check if the student has already marked attendance for this class/date
    const alreadyMarked = await Attendance.findOne({
      studentId,
      classId,
      date: today,
      method: "code",
    });

    if (alreadyMarked) {
      return NextResponse.json({ message: "Already marked" }, { status: 409 });
    }

    // Save new attendance record
    const attendance = await Attendance.create({
      method: "code",
      studentId,
      classId,
      date: today,
      status: "Present",
      records: [], // optional for code-based
    });

    console.log("✅ Attendance saved:", attendance);

    return NextResponse.json({ message: "✅ Attendance marked successfully" });
  } catch (err) {
    console.error("❌ Error saving attendance:", err);
    return NextResponse.json({ message: "Failed to save attendance" }, { status: 500 });
  }
}
