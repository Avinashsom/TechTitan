"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  classId: string;
  email: string;
}

export default function ClassDetail() {
  const { classId } = useParams();
  const { data: session } = useSession();

  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [newRollNo, setNewRollNo] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent">>({});
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch students
  useEffect(() => {
    if (!classId || !session?.user?.id) return;

    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `/api/students?classId=${classId}&teacherId=${session?.user?.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch students");
        const data: Student[] = await res.json();
        setStudents(data);

        const initial: Record<string, "Present" | "Absent"> = {};
        data.forEach((s) => (initial[s._id] = "Absent"));
        setAttendance(initial);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchStudents();
  }, [classId, session?.user?.id]);

  // Add student
  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newStudentName || !newRollNo || !newEmail || !newPassword)
      return setError("All fields are required");

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudentName,
          rollNo: newRollNo,
          email: newEmail,
          password: newPassword,
          classId,
          teacherId: session?.user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add student");

      setSuccess("Student added successfully!");
      setNewStudentName("");
      setNewRollNo("");
      setNewEmail("");
      setNewPassword("");

      const updatedRes = await fetch(
        `/api/students?classId=${classId}&teacherId=${session?.user?.id}`
      );
      const updatedStudents: Student[] = await updatedRes.json();
      setStudents(updatedStudents);

      const initial: Record<string, "Present" | "Absent"> = {};
      updatedStudents.forEach((s) => (initial[s._id] = "Absent"));
      setAttendance(initial);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = (studentId: string, status: "Present" | "Absent") => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject || !date) return setError("Enter subject and date");
    if (!students.length) return setError("No students to mark attendance");

    const records = students.map((s) => ({ studentId: s._id, status: attendance[s._id] }));

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: session?.user?.id,
          classId,
          subject,
          date,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to save attendance");
      else setSuccess("Attendance saved successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Class Detail</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {/* Add Student */}
      <form onSubmit={handleAddStudent} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Student Name"
          value={newStudentName}
          onChange={(e) => setNewStudentName(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />
        <input
          type="text"
          placeholder="Roll No"
          value={newRollNo}
          onChange={(e) => setNewRollNo(e.target.value)}
          className="border px-3 py-2 rounded w-32"
        />
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />
        <input
          type="password"
          placeholder="Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border px-3 py-2 rounded w-32"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Student
        </button>
      </form>

      {/* Attendance */}
      {students.length > 0 ? (
        <form onSubmit={handleSubmitAttendance} className="bg-white p-4 rounded shadow-md">
          <div className="flex gap-4 mb-4 flex-col sm:flex-row">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:w-48"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:flex-1"
            />
          </div>

          <table className="w-full border-collapse border rounded overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Roll No</th>
                <th className="border px-3 py-2 text-center">Present</th>
                <th className="border px-3 py-2 text-center">Absent</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{s.name}</td>
                  <td className="border px-3 py-2">{s.rollNo}</td>
                  <td className="border px-3 py-2 text-center bg-green-50">
                    <input
                      type="radio"
                      name={s._id}
                      checked={attendance[s._id] === "Present"}
                      onChange={() => handleStatusChange(s._id, "Present")}
                      className="accent-green-600 w-5 h-5"
                    />
                  </td>
                  <td className="border px-3 py-2 text-center bg-red-50">
                    <input
                      type="radio"
                      name={s._id}
                      checked={attendance[s._id] === "Absent"}
                      onChange={() => handleStatusChange(s._id, "Absent")}
                      className="accent-red-600 w-5 h-5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-3">
            Submit Attendance
          </button>
        </form>
      ) : (
        <p className="text-gray-600">No students in this class yet.</p>
      )}
    </div>
  );
}
