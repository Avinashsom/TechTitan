'use client';

import { useEffect, useState } from 'react';

interface ClassType {
  _id: string;
  name: string;
  subject: string;
}

export default function TeacherClassSelector({
  onSelect,
}: {
  onSelect: (classId: string) => void;
}) {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    async function fetchClasses() {
      const res = await fetch('/api/teacher/classes');
      if (!res.ok) {
        console.error('Failed to fetch classes');
        return;
      }
      const data = await res.json();
      setClasses(data);
    }
    fetchClasses();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value;
    setSelectedClassId(selected);
    onSelect(selected);
  }

  return (
    <select value={selectedClassId} onChange={handleChange}>
      <option value="">Select Class</option>
      {classes.map((cls) => (
        <option key={cls._id} value={cls._id}>
          {cls.name} - {cls.subject}
        </option>
      ))}
    </select>
  );
}
