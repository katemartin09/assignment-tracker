"use client";

import AssignmentItem from "./AssignmentItem";
import { Assignment } from "../lib/storage";

export default function AssignmentList({
  assignments,
  setAssignments,
}: {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}) {
  function toggleComplete(id: string) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    );
  }

  return (
    <div className="space-y-3">
      {assignments.length === 0 && (
        <p className="text-gray-500">No assignments yet. Add one above!</p>
      )}

      {assignments
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .map((assignment) => (
          <AssignmentItem
            key={assignment.id}
            assignment={assignment}
            toggleComplete={toggleComplete}
          />
        ))}
    </div>
  );
}
