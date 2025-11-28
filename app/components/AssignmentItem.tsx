"use client";

import { Assignment } from "../lib/storage";

export default function AssignmentItem({
  assignment,
  toggleComplete,
}: {
  assignment: Assignment;
  toggleComplete: (id: string) => void;
}) {
  return (
    <div className="border p-4 rounded flex justify-between items-center">
      <div>
        <p className={`text-lg font-semibold ${assignment.completed ? "line-through text-gray-500" : ""}`}>
          {assignment.title}
        </p>
        <p className="text-sm text-gray-600">{assignment.course}</p>
        <p className="text-sm text-gray-500">Due: {assignment.dueDate}</p>
      </div>

      <button
        onClick={() => toggleComplete(assignment.id)}
        className={`px-3 py-1 rounded ${
          assignment.completed ? "bg-green-500 text-white" : "bg-gray-300"
        }`}
      >
        {assignment.completed ? "Done" : "Mark Done"}
      </button>
    </div>
  );
}
