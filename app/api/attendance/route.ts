// app/api/attendance/route.ts
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { teacherId, classId, subject, date, records } = await req.json();

    // ✅ Validate required fields
    if (!teacherId || !classId || !subject || !date || !records) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    // ✅ Normalize date to yyyy-mm-dd
    const normalizedDate = new Date(date).toISOString().split("T")[0];

    // ✅ Clean records (remove empty ones)
    const cleanedRecords = (records || []).filter(
      (r: any) => r.studentId && r.status
    );

    if (cleanedRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid attendance records provided" }),
        { status: 400 }
      );
    }

    // ✅ Check if attendance already exists
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
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
