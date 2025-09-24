"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface AttendanceRecord {
  subject: string;
  status: string;
  date: string;
  teacher: string;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchAttendance = async () => {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/student/${session.user.id}/attendance`);
      const data = await res.json();
      setAttendance(data);
      setLoading(false);
    };

    fetchAttendance();
  }, [session]);

  if (loading) return <p>Loading...</p>;
  if (!attendance.length) return <p>No attendance records found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Attendance</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Date</th>
            <th className="border px-3 py-2">Subject</th>
            <th className="border px-3 py-2">Teacher</th>
            <th className="border px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((record, idx) => (
            <tr key={idx}>
              <td className="border px-3 py-2">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="border px-3 py-2">{record.subject}</td>
              <td className="border px-3 py-2">{record.teacher}</td>
              <td
                className={`border px-3 py-2 font-semibold ${
                  record.status === "Present" ? "text-green-600" : "text-red-600"
                }`}
              >
                {record.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
