// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
// import Attendance from "@/models/Attendance";

// export async function GET(req: Request, { params }: { params: { id: string } }) {
//   await dbConnect();
//   const { id } = params;

//   try {
//     // Find all attendance records where this student appears
//     const attendance = await Attendance.find({
//       "records.studentId": id,
//     }).populate("teacherId", "name email");

//     // Filter only this student's record from each subject entry
//     const studentAttendance = attendance.map((entry) => {
//       const record = entry.records.find((r: any) => r.studentId.toString() === id);
//       return {
//         subject: entry.subject,
//         status: record?.status,
//         date: entry.createdAt,
//         teacher: entry.teacherId?.name,
//       };
//     });

//     return NextResponse.json(studentAttendance);
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
//   }
// }
