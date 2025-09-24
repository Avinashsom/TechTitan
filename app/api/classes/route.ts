import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ClassModel from "@/models/Class";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
    }

    const classes = await ClassModel.find({ teacherId });
    return NextResponse.json(classes);
  } catch (err: any) {
    console.error("Error fetching classes:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, teacherId } = await req.json();

    if (!name || !teacherId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if class already exists for this teacher
    const existing = await ClassModel.findOne({ name, teacherId });
    if (existing) {
      return NextResponse.json(
        { error: "Class already exists for this teacher" },
        { status: 400 }
      );
    }

    const newClass = await ClassModel.create({ name, teacherId });
    return NextResponse.json(newClass, { status: 201 });
  } catch (err: any) {
    console.error("Error creating class:", err);
    return NextResponse.json({ error: err.message || "Failed to create class" }, { status: 500 });
  }
}
