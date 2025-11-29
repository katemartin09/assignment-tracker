"use client";

import { useEffect, useState } from "react";
import { Course, loadCourses, saveCourses } from "../lib/storage";

type ScaleRow = { letter: string; minPercent: string };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("3");
  const [scaleRows, setScaleRows] = useState<ScaleRow[]>([
    { letter: "A", minPercent: "93" },
    { letter: "A-", minPercent: "90" },
    { letter: "B+", minPercent: "87" },
    { letter: "B", minPercent: "83" },
  ]);
  const [saved, setSaved] = useState(false);

useEffect(() => {
  setCourses(loadCourses());
}, []);

useEffect(() => {
  saveCourses(courses);
}, [courses]);

  function addCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const course: Course = {
      id: crypto.randomUUID(),
      name: name.trim(),
      credits: Number(credits) || 0,
      gradingScale: scaleRows
        .filter((r) => r.letter && r.minPercent)
        .map((r) => ({
          letter: r.letter.trim(),
          minPercent: Number(r.minPercent),
        })),
    };

    setCourses((prev) => [...prev, course]);
    setName("");
    setCredits("3");
    setSaved(false);
  }

  function updateScaleRow(index: number, field: keyof ScaleRow, value: string) {
    setScaleRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addScaleRow() {
    setScaleRows((prev) => [...prev, { letter: "", minPercent: "" }]);
  }

  function removeScaleRow(index: number) {
    setScaleRows((prev) => prev.filter((_, i) => i !== index));
  }

  function removeCourse(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setSaved(false);
  }

  function handleSaveCourses() {
    saveCourses(courses);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-sky-900">Courses</h2>
        <form
          onSubmit={addCourse}
          className="bg-white shadow rounded-lg p-4 space-y-4 border border-sky-200"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-sky-900">
                Course name
              </label>
              <input
                className="w-full border rounded px-3 py-2 text-sm border-sky-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-sky-900">
                Credits
              </label>
              <input
                type="number"
                min={0}
                className="w-full border rounded px-3 py-2 text-sm border-sky-300"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-sky-900">
              Grading scale (letter & minimum %)
            </h3>
            <div className="space-y-2">
              {scaleRows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="w-16 border rounded px-2 py-1 text-sm border-sky-300"
                    value={row.letter}
                    onChange={(e) =>
                      updateScaleRow(i, "letter", e.target.value)
                    }
                    placeholder="A"
                  />
                  <input
                    className="w-20 border rounded px-2 py-1 text-sm border-sky-300"
                    value={row.minPercent}
                    onChange={(e) =>
                      updateScaleRow(i, "minPercent", e.target.value)
                    }
                    placeholder="93"
                  />
                  <span className="self-center text-xs text-slate-500">%</span>
                  <button
                    type="button"
                    onClick={() => removeScaleRow(i)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addScaleRow}
                className="text-xs text-sky-700 hover:underline"
              >
                + Add grading row
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded hover:bg-sky-800"
            >
              Add course
            </button>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-xs text-emerald-700">
                  Courses saved ✔
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveCourses}
                className="text-xs text-sky-700 underline"
              >
                Save courses
              </button>
            </div>
          </div>
        </form>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-sky-900">
          Current courses
        </h3>
        <div className="bg-white shadow rounded-lg divide-y border border-sky-200">
          {courses.length === 0 && (
            <p className="p-4 text-sm text-slate-500">
              No courses yet. Add one above.
            </p>
          )}
          {courses.map((c, idx) => {
            const colorClasses = [
              "bg-sky-50 text-sky-800 border-sky-200",
              "bg-teal-50 text-teal-800 border-teal-200",
              "bg-indigo-50 text-indigo-800 border-indigo-200",
              "bg-rose-50 text-rose-800 border-rose-200",
            ];
            const cls = colorClasses[idx % colorClasses.length];

            return (
              <div
                key={c.id}
                className={
                  "p-4 text-sm flex justify-between items-center border-l-4 " +
                  cls
                }
              >
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-slate-600">
                    {c.credits} credit{c.credits === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-600 max-w-xs">
                  {c.gradingScale
                    .sort((a, b) => b.minPercent - a.minPercent)
                    .map((g) => `${g.letter} ≥ ${g.minPercent}%`)
                    .join(" · ")}
                  <div>
                    <button
                      type="button"
                      onClick={() => removeCourse(c.id)}
                      className="mt-1 text-[11px] text-red-600 underline"
                    >
                      Remove course
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
