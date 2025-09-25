import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/db";
import AttendanceCode from "@/models/AttendanceCode";
import { generateRandomCode } from "@/lib/generateCode";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "teacher") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { classId } = body;

    if (!classId) {
      return NextResponse.json({ message: "Missing classId" }, { status: 400 });
    }

    if (!Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ message: "Invalid classId" }, { status: 400 });
    }

    // Generate 6-digit code
    const code = generateRandomCode(6);

    // Expire in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Normalize today's date (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Save attendance code
    const newCode = await AttendanceCode.create({
      classId: new Types.ObjectId(classId),
      code,
      expiresAt,
      date: today, // ✅ store as Date
    });

    console.log("✅ Generated attendance code:", newCode);

    return NextResponse.json({
      code: newCode.code,
      expiresAt: newCode.expiresAt,
    });
  } catch (error) {
    console.error("❌ Error generating code:", error);
    return NextResponse.json({ message: "Error generating code" }, { status: 500 });
  }
}
