"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface AttendanceRecord {
  _id: string;
  studentName: string;
  rollNo: string;
  class: string;
  subject: string;
  status: "Present" | "Absent";
  date: string;
}

export default function TeacherAttendanceView() {
  const { data: session, status } = useSession();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!session?.user?.id || session.user.role !== "teacher") return;

      try {
        const res = await fetch(`/api/attendance/teacher?teacherId=${session.user.id}`);
        const data = await res.json();
        setAttendance(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    if (status === "authenticated") fetchAttendance();
  }, [session, status]);

  if (loading) return <p>Loading...</p>;
  if (!session?.user || session.user.role !== "teacher") return <p>Access denied</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Students Attendance</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Date</th>
            <th className="border px-3 py-2">Student</th>
            <th className="border px-3 py-2">Roll No</th>
            <th className="border px-3 py-2">Class</th>
            <th className="border px-3 py-2">Subject</th>
            <th className="border px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((rec) => (
            <tr key={rec._id}>
              <td className="border px-3 py-2">{new Date(rec.date).toLocaleDateString()}</td>
              <td className="border px-3 py-2">{rec.studentName}</td>
              <td className="border px-3 py-2">{rec.rollNo}</td>
              <td className="border px-3 py-2">{rec.class}</td>
              <td className="border px-3 py-2">{rec.subject}</td>
              <td className={`border px-3 py-2 ${rec.status === "Present" ? "text-green-600" : "text-red-600"}`}>
                {rec.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
