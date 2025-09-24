import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const teacherId = url.searchParams.get("teacherId");
    if (!teacherId) {
      return new Response(JSON.stringify({ error: "Missing teacherId" }), { status: 400 });
    }

    // Fetch all attendance records for this teacher
    const attendance = await Attendance.find({ teacherId }).sort({ date: -1 });

    // Optionally populate student names
    const recordsWithStudentNames = await Promise.all(
      attendance.map(async (rec) => {
        const student = await Student.findById(rec.studentId);
        return {
          _id: rec._id,
          studentName: student?.name || "Unknown",
          rollNo: student?.rollNo || "-",
          class: student?.class || "-",
          subject: rec.subject,
          status: rec.status,
          date: rec.date,
        };
      })
    );

    return new Response(JSON.stringify(recordsWithStudentNames), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
