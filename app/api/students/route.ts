import { NextResponse } from "next/server";
import Student from "@/models/Student";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, rollNo, classId, email, password, teacherId } = await req.json();

    // Validate required fields
    if (!name || !rollNo || !classId || !password || !teacherId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if student already exists in this class for this teacher
    const existing = await Student.findOne({ rollNo, classId, teacherId });
    if (existing) {
      return NextResponse.json({ error: "Student already exists in this class" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const student = await Student.create({
      name,
      rollNo,
      classId,
      email,
      password: hashedPassword,
      teacherId,
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating student:", err);
    return NextResponse.json({ error: err.message || "Failed to create student" }, { status: 500 });
  }
}

// GET /api/students?classId=<>&teacherId=<>
export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const classId = url.searchParams.get("classId");
    const teacherId = url.searchParams.get("teacherId");

    if (!classId || !teacherId) {
      return NextResponse.json([], { status: 200 });
    }

    const students = await Student.find({ classId, teacherId }).select("-password");
    return NextResponse.json(students, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching students:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch students" }, { status: 500 });
  }
}
