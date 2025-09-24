"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Class {
  _id: string;
  name: string;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
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
    fetchClasses();
  }, [session]);

  const handleCreateClass = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

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
      const updated = await fetch(`/api/classes?teacherId=${session?.user?.id}`);
      setClasses(await updated.json());
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectClass = (classId: string) => {
    router.push(`/teacher/class/${classId}`);
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session?.user || session.user.role !== "teacher") return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Teacher Dashboard</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleCreateClass} className="mb-6 flex gap-3 flex-col sm:flex-row">
        <input
          type="text"
          placeholder="New Class Name"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Class</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Your Classes:</h2>
      <ul className="space-y-2">
        {classes.map((c) => (
          <li key={c._id}>
            <button
              onClick={() => handleSelectClass(c._id)}
              className="w-full text-left bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
            >
              {c.name}
            </button>
          </li>
        ))}
        {classes.length === 0 && <p className="text-gray-500">No classes yet.</p>}
      </ul>
    </div>
  );
}
