"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Assignment,
  formatDisplayDate,
  loadAssignments,
  loadCompletedAssignments,
  saveAssignments,
  saveCompletedAssignments,
  todayISO,
} from "../lib/storage";

type ExtraEvent = {
  id: string;
  title: string;
  date: string; // ISO
};

export default function CalendarPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [completed, setCompleted] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<ExtraEvent[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    setAssignments(loadAssignments());
    setCompleted(loadCompletedAssignments());
  }, []);

  const allItems = [...assignments, ...completed];

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateMap = useMemo(() => {
    const map: Record<
      string,
      { assignments: Assignment[]; events: ExtraEvent[] }
    > = {};
    allItems.forEach((a) => {
      if (!map[a.dueDate]) map[a.dueDate] = { assignments: [], events: [] };
      map[a.dueDate].assignments.push(a);
    });
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = { assignments: [], events: [] };
      map[e.date].events.push(e);
    });
    return map;
  }, [allItems, events]);

  function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    setEvents((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: eventTitle.trim(), date: eventDate },
    ]);
    setEventTitle("");
    setEventDate("");
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  // remove assignment (from both “to-do” and “completed” lists)
  function deleteAssignment(id: string) {
    setAssignments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveAssignments(next);
      return next;
    });
    setCompleted((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveCompletedAssignments(next);
      return next;
    });
  }

  const isoToday = todayISO();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-900">Calendar</h2>

      <form
        onSubmit={addEvent}
        className="bg-white shadow rounded-lg p-4 grid gap-4 md:grid-cols-3 text-sm border border-sky-200"
      >
        <div className="md:col-span-3 font-medium text-sky-900">
          Add custom event (Reading Day, Fall Break, etc.)
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sky-900">Title</label>
          <input
            className="border rounded px-2 py-2 border-sky-300"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sky-900">Date</label>
          <input
            type="date"
            className="border rounded px-2 py-2 border-sky-300"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="bg-sky-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-sky-800"
          >
            Add event
          </button>
        </div>
      </form>

      <div className="bg-white shadow rounded-lg p-4 border border-sky-200">
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold text-sky-900">
            {today.toLocaleString("default", { month: "long" })} {year}
          </div>
          <div className="text-xs text-slate-500">
            Today: {formatDisplayDate(isoToday)}
          </div>
        </div>

        <div className="grid grid-cols-7 text-xs font-semibold text-center mb-2 text-sky-900">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Taller, wider calendar */}
        <div className="grid grid-rows-6 gap-1 text-xs">
          {weeks.map((week, i) => (
            <div key={i} className="grid grid-cols-7 gap-1">
              {week.map((day, j) => {
                if (day === null) {
                  return (
                    <div
                      key={j}
                      className="border rounded h-28 bg-slate-50"
                    />
                  );
                }
                const iso = `${year}-${String(month + 1).padStart(
                  2,
                  "0"
                )}-${String(day).padStart(2, "0")}`;
                const info = dateMap[iso];
                const isToday = iso === isoToday;

                return (
                  <div
                    key={j}
                    className={`border rounded h-28 p-1 flex flex-col gap-1 overflow-hidden ${
                      isToday ? "border-sky-500 ring-1 ring-sky-300" : ""
                    }`}
                  >
                    <div className="text-right text-[11px] font-semibold text-sky-900">
                      {day}
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-y-auto">
                      {/* Assignments with X */}
                      {info?.assignments.map((a) => (
                        <div
                          key={a.id}
                          className="bg-sky-100 text-sky-900 rounded px-1 py-0.5 truncate flex items-center justify-between gap-1"
                        >
                          <span className="truncate">{a.title}</span>
                          <button
                            type="button"
                            className="text-[10px] text-red-700 ml-1 flex-shrink-0"
                            onClick={() => deleteAssignment(a.id)}
                            title="Delete this assignment"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {/* Custom events with X */}
                      {info?.events.map((ev) => (
                        <div
                          key={ev.id}
                          className="bg-amber-100 text-amber-900 rounded px-1 py-0.5 truncate flex items-center justify-between gap-1"
                        >
                          <span className="truncate">{ev.title}</span>
                          <button
                            type="button"
                            className="text-[10px] text-red-700 ml-1 flex-shrink-0"
                            onClick={() => deleteEvent(ev.id)}
                            title="Delete this event"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}