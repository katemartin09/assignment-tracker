"use client";

import { Assignment } from "../lib/storage";
import { useState } from "react";

export default function AssignmentForm({
  setAssignments,
}: {
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      title,
      course,
      dueDate,
      completed: false,
    };

    setAssignments((prev) => [...prev, newAssignment]);

    // Clear form
    setTitle("");
    setCourse("");
    setDueDate("");
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3">
      <input
        className="w-full border p-2 rounded"
        placeholder="Assignment title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Course name"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        required
      />

      <input
        type="date"
        className="w-full border p-2 rounded"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Assignment
      </button>
    </form>
  );
}
