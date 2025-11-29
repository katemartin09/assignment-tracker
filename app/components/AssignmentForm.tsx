"use client";

import { useState } from "react";
import { Assignment, AssignmentType, Status } from "../lib/storage";

export default function AssignmentForm({
  setAssignments,
}: {
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}) {
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<AssignmentType>("assignment");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<Status>("to-start");
  const [dueDate, setDueDate] = useState("");

  const todayStr = new Date().toISOString().slice(0, 10);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!subject || !title || !dueDate) return;

    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      subject,
      type,
      title,
      details,
      status,
      dueDate,
      createdAt: todayStr,
    };

    setAssignments((prev) => [...prev, newAssignment]);

    // clear form
    setSubject("");
    setType("assignment");
    setTitle("");
    setDetails("");
    setStatus("to-start");
    setDueDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white/5 border border-gray-700 rounded-lg p-4 space-y-3"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="Computer Ethics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as AssignmentType)}
          >
            <option value="project">Project</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
            <option value="paper">Paper</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            <option value="to-start">To start</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Assignment Title
        </label>
        <input
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="Final Paper Due - AI Chatbot Project"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Details</label>
        <textarea
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          rows={2}
          placeholder="11:00 AM, see spec and rubric"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Current Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100"
            value={todayStr}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex items-center bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Assignment
      </button>
    </form>
  );
}
