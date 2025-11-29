"use client";

import { Assignment, AssignmentStatus } from "../lib/storage";
import AssignmentItem from "./AssignmentItem";

export default function AssignmentList({
  assignments,
  setAssignments,
}: {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}) {
  function handleStatusChange(id: string, status: AssignmentStatus) {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  const sorted = [...assignments].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );

  return (
    <div className="bg-white/5 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-8 gap-2 bg-green-700 text-white text-xs md:text-sm font-semibold py-2 px-2">
        <div className="text-center">Days Remaining</div>
        <div className="text-center">Status</div>
        <div className="text-center">Subject</div>
        <div className="text-center">Type</div>
        <div className="col-span-2 text-center">Assignment Title / Details</div>
        <div className="text-center">Current Date</div>
        <div className="text-center">Due Date</div>
      </div>

      {/* Rows */}
      <div className="px-2">
        {sorted.length === 0 && (
          <div className="py-4 text-center text-gray-500 text-sm">
            No assignments yet. Add one above!
          </div>
        )}

        {sorted.map((assignment) => (
          <AssignmentItem
            key={assignment.id}
            assignment={assignment}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
