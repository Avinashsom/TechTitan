'use client';

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import CountdownTimer from '@/components/CountdownTimer';

interface ClassType {
  _id: string;
  name: string;
  subject: string;
}

export default function GenerateCodePage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [classId, setClassId] = useState('');
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch teacher's classes on mount
  useEffect(() => {
  async function fetchClasses() {
    try {
      const res = await fetch('/api/teachers/classes');
      if (!res.ok) {
        setMessage('Failed to fetch classes.');
        return;
      }
      const data = await res.json();
      setClasses(data);
    } catch {
      setMessage('Server error fetching classes.');
    }
  }
  fetchClasses();
}, []);

  const handleGenerateCode = async () => {
    if (!classId) {
      setMessage('Please select a class');
      return;
    }

    setLoading(true);
    setMessage('');
    setCode('');
    setExpiresAt(null);

    try {
      const res = await fetch('/api/attendance/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Something went wrong.');
      } else {
        setCode(data.code);
        setExpiresAt(data.expiresAt);
        setMessage('');
      }
    } catch {
      setMessage('Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Generate Attendance Code</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Select Class</label>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">-- Select Class --</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name} - {cls.subject}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerateCode}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Code'}
      </button>

      {message && <p className="mt-4 text-red-600 text-sm">{message}</p>}

      {code && expiresAt && (
        <div className="mt-6 text-center border rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Attendance Code</h2>
          <p className="text-3xl font-mono tracking-wider">{code}</p>

          <div className="mt-4">
            <h3 className="text-md font-medium">QR Code</h3>
            <div className="inline-block bg-white p-2 mt-2">
              <QRCode value={code} size={128} />
            </div>
          </div>

          <div className="mt-4">
            <CountdownTimer expiresAt={expiresAt} />
          </div>
        </div>
      )}
    </div>
  );
}
