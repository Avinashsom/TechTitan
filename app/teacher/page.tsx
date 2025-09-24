'use client';

import { useState } from 'react';

interface Record {
  studentId: {
    _id: string;
    name: string;
    rollNumber: string;
  };
  status: 'Present' | 'Absent';
}

export default function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState('');
  const [records, setRecords] = useState<Record[]>([]);
  const [message, setMessage] = useState('');

  const fetchAttendance = async () => {
    if (!teacherId || !classId || !date) {
      setMessage('Please fill in all fields.');
      return;
    }

    setMessage('Loading...');

    try {
      const res = await fetch('/api/attendance/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, classId, date }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Error fetching attendance.');
        setRecords([]);
        return;
      }

      setRecords(data.records || []);
      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('Server error.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Teacher Attendance History</h1>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Teacher ID"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Class ID"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={fetchAttendance}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Fetch Attendance
      </button>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

      {records.length > 0 && (
        <div className="mt-6 border rounded bg-white shadow">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Roll No</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{r.studentId?.name || 'N/A'}</td>
                  <td className="p-2">{r.studentId?.rollNumber || 'N/A'}</td>
                  <td className={`p-2 font-medium ${r.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
