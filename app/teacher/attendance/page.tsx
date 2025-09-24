"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";

// Extend the session user type to include id and role
interface SessionUser {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Session {
  user?: SessionUser;
}

// Augment NextAuth types for custom user fields
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
  interface Session {
    user?: User;
  }
}

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  class: string;
}

export default function TeacherAttendance() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [subject, setSubject] = useState("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === "unauthenticated") signIn("/login");
  }, [status]);

  // Fetch students after session is loaded
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);

        // Initialize attendance to "Absent"
        const initial: Record<string, string> = {};
        data.forEach((s: Student) => {
          initial[s._id] = "Absent";
        });
        setAttendance(initial);
        setLoadingStudents(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch students");
        setLoadingStudents(false);
      }
    };

    if (status === "authenticated") {
      fetchStudents();
    }
  }, [status]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject) {
      setError("Please enter a subject");
      return;
    }

    if (!session?.user?.id || session.user.role !== "teacher") {
      setError("Teacher not logged in");
      return;
    }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: session.user.id,
          subject,
          records: Object.keys(attendance).map((studentId) => ({
            studentId,
            status: attendance[studentId],
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to save attendance");
      else setSuccess("Attendance saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save attendance");
    }
  };

  if (status === "loading" || loadingStudents) return <p>Loading...</p>;
  if (!session || !session.user || session.user.role !== "teacher") return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Subject Name"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border px-3 py-2 rounded mb-4 w-full max-w-sm"
          required
        />

        <table className="w-full border-collapse border mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Roll No</th>
              <th className="border px-3 py-2">Class</th>
              <th className="border px-3 py-2">Present</th>
              <th className="border px-3 py-2">Absent</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td className="border px-3 py-2">{student.name}</td>
                <td className="border px-3 py-2">{student.rollNo}</td>
                <td className="border px-3 py-2">{student.class}</td>
                <td className="border px-3 py-2 text-center">
                  <input
                    type="radio"
                    name={student._id}
                    checked={attendance[student._id] === "Present"}
                    onChange={() => handleStatusChange(student._id, "Present")}
                  />
                </td>
                <td className="border px-3 py-2 text-center">
                  <input
                    type="radio"
                    name={student._id}
                    checked={attendance[student._id] === "Absent"}
                    onChange={() => handleStatusChange(student._id, "Absent")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Submit Attendance
        </button>
      </form>
    </div>
  );
}
