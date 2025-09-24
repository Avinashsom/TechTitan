import { NextResponse } from "next/server";
import Teacher from "@/models/Teacher";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if teacher already exists
    const existing = await Teacher.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Teacher already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = await Teacher.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "Teacher created successfully", teacher });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
