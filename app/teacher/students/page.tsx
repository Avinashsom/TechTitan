"use client";

import { useEffect, useState, FormEvent } from "react";

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  class: string;
  email: string;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [className, setClassName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // added password
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch students from API
  const fetchStudents = async () => {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add new student
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rollNo,
          class: className,
          email,
          password, // send password
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add student");
      } else {
        setSuccess("Student added successfully!");
        setName("");
        setRollNo("");
        setClassName("");
        setEmail("");
        setPassword(""); // reset password
        fetchStudents(); // Refresh table
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Students</h1>

      {/* Add Student Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-white p-4 rounded shadow-md max-w-md"
      >
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />

        <input
          type="text"
          placeholder="Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />

        <input
          type="text"
          placeholder="Class"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Student
        </button>
      </form>

      {/* Students Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Roll No</th>
            <th className="border px-3 py-2">Class</th>
            <th className="border px-3 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td className="border px-3 py-2">{student.name}</td>
              <td className="border px-3 py-2">{student.rollNo}</td>
              <td className="border px-3 py-2">{student.class}</td>
              <td className="border px-3 py-2">{student.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
