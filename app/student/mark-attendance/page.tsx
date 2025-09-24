'use client';

import { useState } from 'react';
import QRScanner from '@/components/QRScanner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MarkAttendancePage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { data: session } = useSession();
  const studentId = session?.user?.id || ''; // ✅ get from session instead of manual input

  const handleSubmit = async () => {
    if (!code || !studentId) {
      setMessage('Please enter attendance code. (Login required)');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, studentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Something went wrong.');
      } else {
        setMessage('✅ Attendance marked successfully!');
        setCode('');
      }
    } catch (error) {
      setMessage('❌ Server error.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScanned = (scannedCode: string) => {
    setCode(scannedCode);
    setMessage(`Scanned: ${scannedCode}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>

      {/* QR Scanner */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <QRScanner onScan={handleQRCodeScanned} />
      </div>

      {/* OR manual code entry */}
      <div className="mb-4">
        <label className="block font-medium">Or Enter Code Manually:</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="border p-2 w-full mt-1 rounded"
          placeholder="Enter attendance code"
          suppressHydrationWarning // ✅ fixes hydration error
        />
      </div>

      {/* No need for manual Student ID input anymore */}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
        suppressHydrationWarning // ✅ fixes hydration error
      >
        {loading ? 'Submitting...' : 'Submit Attendance'}
      </button>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
}
