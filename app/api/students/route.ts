import { NextResponse } from "next/server";
import Student from "@/models/Student";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, rollNo, class: className, email, password } = await req.json();

    // Validate required fields
    if (!name || !rollNo || !className || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      rollNo,
      class: className,
      email,
      password: hashedPassword, // store hashed password
    });

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create student" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const students = await Student.find().select("-password"); // don't send passwords
    return NextResponse.json(students);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to fetch students" }, { status: 500 });
  }
}
