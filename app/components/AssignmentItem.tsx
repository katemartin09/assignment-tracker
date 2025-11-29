"use client";

import { Assignment, getDaysRemaining, Status } from "../lib/storage";

function statusClasses(status: Status) {
  switch (status) {
    case "to-start":
      return "bg-red-100 text-red-800";
    case "in-progress":
      return "bg-yellow-100 text-yellow-800";
    case "done":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function typeColor(type: string | undefined) {
  switch (type) {
    case "project":
      return "bg-pink-100 text-pink-800";
    case "quiz":
      return "bg-orange-100 text-orange-800";
    case "exam":
      return "bg-red-200 text-red-900";
    case "assignment":
      return "bg-blue-100 text-blue-800";
    case "paper":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AssignmentItem({
  assignment,
  onStatusChange,
}: {
  assignment: Assignment;
  onStatusChange: (id: string, status: Status) => void;
}) {
  const days = getDaysRemaining(assignment.dueDate);
  const todayStr = new Date().toISOString().slice(0, 10);

  // ✅ Make sure type is always something safe
  const safeType = assignment.type ?? "assignment";
  const typeLabel =
    safeType.charAt(0).toUpperCase() + safeType.slice(1);

  return (
    <div className="grid grid-cols-8 gap-2 items-center text-xs md:text-sm border-b border-gray-200 py-2">
      {/* Days Remaining */}
      <div className="font-semibold text-center">
        {days >= 0 ? days : "Overdue"}
      </div>

      {/* Status dropdown */}
      <div className="flex justify-center">
        <select
          className={`px-2 py-1 rounded-full border border-transparent ${statusClasses(
            assignment.status
          )}`}
          value={assignment.status}
          onChange={(e) =>
            onStatusChange(assignment.id, e.target.value as Status)
          }
        >
          <option value="to-start">To start</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Subject */}
      <div className="text-center font-medium">
        {assignment.subject || "—"}
      </div>

      {/* Type */}
      <div className="flex justify-center">
        <span
          className={
            "px-2 py-1 rounded-full text-xs font-semibold " +
            typeColor(assignment.type)
          }
        >
          {typeLabel}
        </span>
      </div>

      {/* Title + Details */}
      <div className="col-span-2">
        <div className="font-semibold">
          {assignment.title || "Untitled"}
        </div>
        {assignment.details && (
          <div className="text-gray-600 text-xs">
            {assignment.details}
          </div>
        )}
      </div>

      {/* Current Date (display only) */}
      <div className="text-center">{todayStr}</div>

      {/* Due Date */}
      <div className="text-center font-semibold">
        {assignment.dueDate || "—"}
      </div>
    </div>
  );
}
