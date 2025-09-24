import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

interface Params {
  params: { id: string };
}

// GET /api/student/:id/attendance
export async function GET(req: Request, { params }: Params) {
  try {
    await dbConnect();

    const { id } = params; // studentId
    const records = await Attendance.find({ studentId: id }).sort({ date: -1 });

    return NextResponse.json(records);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
