import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    if (!studentId) {
      return new Response(JSON.stringify({ error: "Missing studentId" }), { status: 400 });
    }

    const attendance = await Attendance.find({ studentId }).sort({ date: -1 });
    return new Response(JSON.stringify(attendance), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
