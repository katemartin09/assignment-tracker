"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Assignment,
  AssignmentStatus,
  AssignmentType,
  Course,
  loadAssignments,
  saveAssignments,
  loadCourses,
  formatDisplayDate,
  getDaysRemaining,
  todayISO,
  loadCompletedAssignments,
  saveCompletedAssignments,
} from "../lib/storage";

const STATUS_OPTIONS: { value: AssignmentStatus; label: string }[] = [
  { value: "to-start", label: "To Start" },
  { value: "in-progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "revision", label: "Revision" },
  { value: "done", label: "Done" },
];

const TYPE_OPTIONS: AssignmentType[] = [
  "assignment",
  "exam",
  "quiz",
  "lab",
  "reading",
  "paper",
  "project",
];

function statusColorClasses(status: AssignmentStatus) {
  switch (status) {
    case "to-start":
      return "bg-rose-100 text-rose-800";
    case "in-progress":
      return "bg-amber-100 text-amber-800";
    case "submitted":
      return "bg-emerald-100 text-emerald-800";
    case "revision":
      return "bg-orange-100 text-orange-800";
    case "done":
      return "bg-sky-100 text-sky-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function rowHighlight(type: AssignmentType, days: number | null) {
  if (type === "exam") {
    return "bg-rose-100"; // exams always red-ish
  }
  if (days === null || Number.isNaN(days)) return "bg-white";
  if (days <= 0) return "bg-rose-100";
  if (days === 1) return "bg-rose-100";
  if (days === 2) return "bg-orange-100";
  if (days === 3) return "bg-yellow-50";
  if (days >= 4 && days <= 7) return "bg-emerald-100";
  return "bg-white";
}

export default function AssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [courseId, setCourseId] = useState<string>("");
  const [status, setStatus] = useState<AssignmentStatus>("to-start");
  const [type, setType] = useState<AssignmentType>("assignment");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    setCourses(loadCourses());
    setAssignments(loadAssignments());
  }, []);

  useEffect(() => {
    saveAssignments(assignments);
  }, [assignments]);

  const sortedAssignments = useMemo(
    () => [...assignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [assignments]
  );

  function handleAddAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const selectedCourse = courses.find((c) => c.id === courseId) ?? null;

    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      courseId: selectedCourse ? selectedCourse.id : null,
      subjectName: selectedCourse ? selectedCourse.name : "",
      status,
      type,
      title: title.trim(),
      details: details.trim(),
      dueDate,
      createdAt: todayISO(),
    };

    setAssignments((prev) => [...prev, newAssignment]);

    setCourseId("");
    setStatus("to-start");
    setType("assignment");
    setTitle("");
    setDetails("");
    setDueDate("");
  }

  function handleStatusChange(id: string, newStatus: AssignmentStatus) {
    setAssignments((prev) => {
      const current = [...prev];
      const idx = current.findIndex((a) => a.id === id);
      if (idx === -1) return current;

      const updated = { ...current[idx], status: newStatus };

      if (newStatus === "done") {
        const remaining = current.filter((a) => a.id !== id);

        const completed = loadCompletedAssignments();
        const withoutThis = completed.filter((a) => a.id !== updated.id);
        saveCompletedAssignments([...withoutThis, updated]);

        return remaining;
      }

      current[idx] = updated;
      return current;
    });
  }

  const todayDisplay = formatDisplayDate(todayISO());

  return (
    <div className="space-y-8">
      {/* List FIRST */}
      <section>
        <div className="bg-sky-200 text-sky-900 font-semibold text-xs md:text-sm grid grid-cols-8 gap-2 px-3 py-2 rounded-t-lg">
          <div className="text-center">Days</div>
          <div className="text-center">Status</div>
          <div className="text-center">Subject</div>
          <div className="text-center">Type</div>
          <div className="col-span-2 text-center">Title / Details</div>
          <div className="text-center">Today</div>
          <div className="text-center">Due</div>
        </div>

        <div className="bg-white shadow rounded-b-lg divide-y">
          {sortedAssignments.length === 0 && (
            <p className="p-4 text-sm text-slate-500">
              No assignments yet. Add one below.
            </p>
          )}

          {sortedAssignments.map((a, idx) => {
            const days = getDaysRemaining(a.dueDate);
            const dueDisplay = formatDisplayDate(a.dueDate);
            const highlight = rowHighlight(a.type, days);

            const courseIndex = courses.findIndex(
              (c) => c.id === a.courseId
            );
            const subjectClasses = [
              "bg-sky-50 text-sky-800",
              "bg-teal-50 text-teal-800",
              "bg-indigo-50 text-indigo-800",
              "bg-rose-50 text-rose-800",
            ];
            const subjectCls =
              courseIndex >= 0
                ? subjectClasses[courseIndex % subjectClasses.length]
                : "bg-slate-50 text-slate-800";

            return (
              <div
                key={a.id + "-" + idx}
                className={
                  "grid grid-cols-8 gap-2 px-3 py-2 items-center text-xs md:text-sm " +
                  highlight
                }
              >
                <div className="font-semibold text-center">
                  {Number.isNaN(days) ? "" : days >= 0 ? days : "Overdue"}
                </div>

                <div className="text-center">
                  <select
                    className={
                      "border rounded-full px-2 py-1 text-xs " +
                      statusColorClasses(a.status)
                    }
                    value={a.status}
                    onChange={(e) =>
                      handleStatusChange(
                        a.id,
                        e.target.value as AssignmentStatus
                      )
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center font-medium">
                  <span
                    className={
                      "px-2 py-1 rounded-full text-[11px] " +
                      subjectCls
                    }
                  >
                    {a.subjectName || "—"}
                  </span>
                </div>

                <div className="text-center text-xs">
                  {a.type.charAt(0).toUpperCase() + a.type.slice(1)}
                </div>

                <div className="col-span-2">
                  <div className="font-semibold">{a.title}</div>
                  {a.details && (
                    <div className="text-slate-600 text-xs">
                      {a.details}
                    </div>
                  )}
                </div>

                <div className="text-center text-xs">{todayDisplay}</div>
                <div className="text-center font-semibold text-xs">
                  {dueDisplay}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Form SECOND */}
      <section className="bg-sky-50 border border-sky-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2 text-sky-900">
          Add Assignment
        </h2>

        <form
          onSubmit={handleAddAssignment}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm"
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sky-900">Course</label>
            <select
              className="border rounded px-2 py-2 border-sky-300"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">No course selected</option>
              {courses.map((course, idx) => {
                const colorClasses = [
                  "bg-sky-50 text-sky-800",
                  "bg-teal-50 text-teal-800",
                  "bg-indigo-50 text-indigo-800",
                  "bg-rose-50 text-rose-800",
                ];
                const cls = colorClasses[idx % colorClasses.length];
                return (
                  <option key={course.id} value={course.id} className={cls}>
                    {course.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-sky-900">Status</label>
            <select
              className="border rounded px-2 py-2 border-sky-300"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as AssignmentStatus)
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-sky-900">Type</label>
            <select
              className="border rounded px-2 py-2 border-sky-300"
              value={type}
              onChange={(e) =>
                setType(e.target.value as AssignmentType)
              }
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-sky-900">Due Date</label>
            <input
              type="date"
              className="border rounded px-2 py-2 border-sky-300"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-medium text-sky-900">Title</label>
            <input
              className="border rounded px-2 py-2 border-sky-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-4">
            <label className="font-medium text-sky-900">Details</label>
            <textarea
              rows={2}
              className="border rounded px-2 py-2 border-sky-300"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="bg-sky-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-sky-800"
            >
              Add Assignment
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}