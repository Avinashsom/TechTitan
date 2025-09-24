"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Class {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  classId: string;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch classes
  const fetchClasses = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/classes?teacherId=${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setClasses(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [session]);

  // Create new class
  const handleCreateClass = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newClassName) return setError("Enter class name");

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName, teacherId: session?.user?.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create class");
      setSuccess("Class created successfully!");
      setNewClassName("");
      fetchClasses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch students
  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/students?classId=${selectedClass}`);
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);

        // Initialize attendance
        const initial: Record<string, string> = {};
        data.forEach((s: Student) => (initial[s._id] = "Absent"));
        setAttendance(initial);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // Submit attendance
  const handleSubmitAttendance = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject) return setError("Please enter a subject");
    if (!date) return setError("Please select a date");
    if (!selectedClass) return setError("Please select a class");

    // Map valid records
    const records = students.map((s) => ({
      studentId: s._id,
      status: attendance[s._id] || "Absent",
    }));

    if (records.length === 0) return setError("No students to mark attendance");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: session?.user?.id,
          classId: selectedClass,
          subject,
          date,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Attendance already marked for this date") {
          setError("⚠️ Attendance already marked for this class, subject, and date.");
        } else {
          setError(data.error || "Failed to save attendance");
        }
      } else {
        setSuccess("✅ Attendance saved successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save attendance");
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session?.user || session.user.role !== "teacher") return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Teacher Dashboard
      </h1>

      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}
      {success && <p className="text-green-600 font-medium mb-4">{success}</p>}

      {/* Create Class */}
      <form onSubmit={handleCreateClass} className="mb-8 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="New Class Name"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          className="border px-3 py-2 rounded flex-1 focus:ring focus:ring-blue-300"
        />
        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Create Class
        </button>
      </form>

      {/* Class Selection */}
      <div className="mb-6">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-64 focus:ring focus:ring-blue-300"
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Form */}
      {selectedClass && students.length > 0 && (
        <form onSubmit={handleSubmitAttendance} className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:w-48 focus:ring focus:ring-blue-300"
              required
            />
            <input
              type="text"
              placeholder="Subject Name"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border px-3 py-2 rounded w-full sm:flex-1 focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Name</th>
                  <th className="border px-3 py-2 text-left">Roll No</th>
                  <th className="border px-3 py-2 text-center">Present</th>
                  <th className="border px-3 py-2 text-center">Absent</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{student.name}</td>
                    <td className="border px-3 py-2">{student.rollNo}</td>
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
          </div>

          <button className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
            Submit Attendance
          </button>
        </form>
      )}

      {selectedClass && students.length === 0 && (
        <p className="text-gray-600">No students in this class yet.</p>
      )}
    </div>
  );
}
