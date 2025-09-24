// app/api/attendance/route.ts
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import { NextResponse } from "next/server";

interface AttendanceRecord {
  studentId: string;
  status: "Present" | "Absent";
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { teacherId, classId, subject, date, records }: {
      teacherId: string;
      classId: string;
      subject: string;
      date: string;
      records: AttendanceRecord[];
    } = await req.json();

    // ✅ Validate required fields
    if (!teacherId || !classId || !subject || !date || !records) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400 }
      );
    }

    // ✅ Normalize date to yyyy-mm-dd
    const normalizedDate = new Date(date).toISOString().split("T")[0];

    // ✅ Clean records (remove invalid)
    const cleanedRecords = records.filter(
      (r) => r.studentId && (r.status === "Present" || r.status === "Absent")
    );

    if (cleanedRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid attendance records provided" }),
        { status: 400 }
      );
    }

    // ✅ Check for duplicate attendance
    const existing = await Attendance.findOne({
      teacherId,
      classId,
      subject,
      date: normalizedDate,
    });

    if (existing) {
      return new Response(
        JSON.stringify({
          error: "Attendance already marked for this class, subject, and date",
        }),
        { status: 400 }
      );
    }

    // ✅ Create new attendance entry
    const newAttendance = await Attendance.create({
      teacherId,
      classId,
      subject,
      date: normalizedDate,
      records: cleanedRecords,
    });

    return new Response(JSON.stringify(newAttendance), { status: 201 });
  } catch (err: any) {
    console.error("Error saving attendance:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to save attendance" }),
      { status: 500 }
    );
  }
}
