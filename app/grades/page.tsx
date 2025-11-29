// app/grades/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Course,
  Assignment,
  GradeCategory,
  CourseGradeConfig,
  GradeRecord,
  loadCourses,
  loadCompletedAssignments,
  loadGradeConfigs,
  saveGradeConfigs,
  loadGradeRecords,
  saveGradeRecords,
} from "../lib/storage";

type CourseView = {
  course: Course;
  assignments: Assignment[];
  config: CourseGradeConfig | null;
  records: GradeRecord[];
};

export default function GradesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<
    Assignment[]
  >([]);
  const [configs, setConfigs] = useState<CourseGradeConfig[]>([]);
  const [records, setRecords] = useState<GradeRecord[]>([]);

  useEffect(() => {
    setCourses(loadCourses());
    setCompletedAssignments(loadCompletedAssignments());
    setConfigs(loadGradeConfigs());
    setRecords(loadGradeRecords());
  }, []);

  useEffect(() => {
    saveGradeConfigs(configs);
  }, [configs]);

  useEffect(() => {
    saveGradeRecords(records);
  }, [records]);

  const views: CourseView[] = useMemo(() => {
    return courses.map((c) => {
      const assignments = completedAssignments.filter(
        (a) => a.courseId === c.id
      );
      const config = configs.find((cfg) => cfg.courseId === c.id) || null;
      const courseRecords = records.filter((r) => r.courseId === c.id);
      return { course: c, assignments, config, records: courseRecords };
    });
  }, [courses, completedAssignments, configs, records]);

  function updateCategories(courseId: string, categories: GradeCategory[]) {
    setConfigs((prev) => {
      const others = prev.filter((c) => c.courseId !== courseId);
      return [...others, { courseId, categories }];
    });
  }

  function upsertRecord(
    courseId: string,
    assignmentId: string,
    categoryId: string,
    scorePercent: number
  ) {
    setRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.assignmentId === assignmentId
      );
      const base = {
        id: existingIdx === -1 ? crypto.randomUUID() : prev[existingIdx].id,
        assignmentId,
        courseId,
        categoryId,
        scorePercent,
      };
      if (existingIdx === -1) return [...prev, base];
      const copy = [...prev];
      copy[existingIdx] = base;
      return copy;
    });
  }

  function computeCoursePercent(view: CourseView): number | null {
    if (!view.config || view.config.categories.length === 0) return null;
    const { categories } = view.config;

    const usedCategories = categories.filter((cat) =>
        view.records.some((r) => r.categoryId === cat.id)
    );
      if (usedCategories.length === 0) return null;

    let weightedSum = 0;   // sum of avg% * weight
    let usedWeight = 0;    // sum of weights actually used

    usedCategories.forEach((cat) => {
        const catRecords = view.records.filter(
        (r) => r.categoryId === cat.id
        );
        if (catRecords.length === 0) return;

        const avg =
        catRecords.reduce((sum, r) => sum + r.scorePercent, 0) /
        catRecords.length; // avg is 0–100

        weightedSum += avg * cat.weightPercent;
        usedWeight += cat.weightPercent;
    });

    if (usedWeight === 0) return null;

  // result is 0–1 (not 0–100)
    return (weightedSum / usedWeight);
}



  function letterFromPercent(course: Course, percent: number | null): string {
    if (percent === null || Number.isNaN(percent)) return "N/A";
    const sorted = [...course.gradingScale].sort(
      (a, b) => b.minPercent - a.minPercent
    );
    const match = sorted.find((g) => percent >= g.minPercent);
    return match ? match.letter : "F";
  }

  function pointsForLetter(letter: string): number {
    const map: Record<string, number> = {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      F: 0,
    };
    return map[letter] ?? 0;
  }

  const gpa = useMemo(() => {
    let points = 0;
    let credits = 0;
    views.forEach((v) => {
      const percent = computeCoursePercent(v);
      if (percent === null) return;
      const letter = letterFromPercent(v.course, percent);
      const p = pointsForLetter(letter);
      if (v.course.credits > 0) {
        points += p * v.course.credits;
        credits += v.course.credits;
      }
    });
    if (credits === 0) return null;
    return points / credits;
  }, [views]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Grades</h2>

      {views.length === 0 && (
        <p className="text-sm text-slate-500">
          Add courses and complete assignments to start tracking grades.
        </p>
      )}

      {views.map((view) => {
        const coursePercent = computeCoursePercent(view);
        const letter = letterFromPercent(view.course, coursePercent);

        return (
          <div key={view.course.id} className="bg-white shadow rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="text-lg font-semibold">{view.course.name}</h3>
                <p className="text-xs text-slate-500">
                  {view.course.credits} credits
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Current grade</div>
                <div className="text-xl font-bold">
                  {coursePercent !== null ? coursePercent.toFixed(1) + "%" : "—"}{" "}
                  <span className="text-slate-500 text-sm">{letter}</span>
                </div>
              </div>
            </div>

            {/* Category config */}
            <CategoryEditor
              view={view}
              onChange={(cats) => updateCategories(view.course.id, cats)}
            />

            {/* Completed assignments for this course */}
            <AssignmentGradesTable
              view={view}
              onChangeRecord={upsertRecord}
            />
            <NeededAverageSection
              view={view}
              computeCoursePercent={computeCoursePercent}
              letterFromPercent={letterFromPercent}
            />
          </div>
        );
      })}

      <section className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Predicted GPA</h3>
        <p className="text-sm text-slate-600 mb-2">
          Based on current grades and course credits.
        </p>
        <div className="text-2xl font-bold">
          {gpa === null ? "—" : gpa.toFixed(2)}
        </div>
      </section>
    </div>
  );
}

// ----- Helper components -----

function CategoryEditor({
  view,
  onChange,
}: {
  view: CourseView;
  onChange: (cats: GradeCategory[]) => void;
}) {
  const cats = view.config?.categories ?? [];

  function updateCat(index: number, field: keyof GradeCategory, value: string) {
    const copy = [...cats];
    const target = { ...copy[index] };
    if (field === "weightPercent") {
      target.weightPercent = Number(value) || 0;
    } else if (field === "name") {
      target.name = value;
    }
    copy[index] = target;
    onChange(copy);
  }

  function addCat() {
    onChange([
      ...cats,
      { id: crypto.randomUUID(), name: "", weightPercent: 0 },
    ]);
  }

  return (
    <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold">
          Grade distribution (percent weights)
        </span>
        <button
          type="button"
          onClick={addCat}
          className="text-xs text-blue-600 hover:underline"
        >
          + Add category
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-3 text-xs">
        {cats.map((cat, idx) => (
          <div
            key={cat.id}
            className="flex items-center gap-2 bg-white border rounded px-2 py-1"
          >
            <input
              className="flex-1 border rounded px-1 py-0.5 text-xs"
              value={cat.name}
              onChange={(e) => updateCat(idx, "name", e.target.value)}
              placeholder="Quizzes"
            />
            <input
              className="w-16 border rounded px-1 py-0.5 text-xs"
              value={cat.weightPercent}
              onChange={(e) => updateCat(idx, "weightPercent", e.target.value)}
              placeholder="25"
            />
            <span>%</span>
          </div>
        ))}
        {cats.length === 0 && (
          <p className="text-xs text-slate-500">
            Add categories (e.g., Quizzes 25%, Final 50%, Project 25%).
          </p>
        )}
      </div>
    </div>
  );
}

function AssignmentGradesTable({
  view,
  onChangeRecord,
}: {
  view: CourseView;
  onChangeRecord: (
    courseId: string,
    assignmentId: string,
    categoryId: string,
    scorePercent: number
  ) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const cats = view.config?.categories ?? [];

  return (
    <div className="border rounded-lg bg-white">
      {/* Header with collapse/expand toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-sky-50">
        <div className="text-xs font-semibold text-sky-900">
          Assignment Grades
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="text-xs text-sky-700"
          title={collapsed ? "Show assignments" : "Hide assignments"}
        >
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      {/* Only show table when not collapsed */}
      {!collapsed && (
        <>
          <div className="bg-slate-100 text-xs font-semibold grid grid-cols-4 gap-2 px-3 py-2">
            <div>Assignment</div>
            <div>Category</div>
            <div>Score (%)</div>
            <div></div>
          </div>
          <div className="divide-y bg-white text-xs">
            {view.assignments.length === 0 && (
              <div className="px-3 py-2 text-slate-500">
                No completed assignments for this course yet.
              </div>
            )}

            {view.assignments.map((a, idx) => {
              const existing = view.records.find(
                (r) => r.assignmentId === a.id
              );

              return (
                <div
                  key={a.id + "-" + idx}
                  className="grid grid-cols-4 gap-2 px-3 py-2 items-center"
                >
                  <div className="truncate">{a.title}</div>

                  <div>
                    <select
                      className="border rounded px-2 py-1 w-full border-sky-300"
                      value={existing?.categoryId ?? ""}
                      onChange={(e) =>
                        onChangeRecord(
                          view.course.id,
                          a.id,
                          e.target.value,
                          existing?.scorePercent ?? 0
                        )
                      }
                    >
                      <option value="">Select</option>
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      className="border rounded px-2 py-1 w-full border-sky-300 text-right"
                      value={existing?.scorePercent ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;

                        // allow empty while typing
                        if (raw === "") {
                          onChangeRecord(
                            view.course.id,
                            a.id,
                            existing?.categoryId ?? "",
                            0
                          );
                          return;
                        }

                        const num = Number(raw);
                        if (!Number.isNaN(num)) {
                          onChangeRecord(
                            view.course.id,
                            a.id,
                            existing?.categoryId ?? "",
                            num
                          );
                        }
                      }}
                    />
                  </div>

                  <div></div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
             
function NeededAverageSection({
  view,
  computeCoursePercent,
  letterFromPercent,
}: {
  view: CourseView;
  computeCoursePercent: (v: CourseView) => number | null;
  letterFromPercent: (course: Course, percent: number | null) => string;
}) {
  const [goalLetter, setGoalLetter] = useState<string>("");
  const [goalPercentOverride, setGoalPercentOverride] = useState<string>("");

  const totalWeight = view.config
    ? view.config.categories.reduce(
        (sum, c) => sum + c.weightPercent,
        0
      )
    : 0;

  const usedWeight = view.config
    ? view.config.categories
        .filter((cat) =>
          view.records.some((r) => r.categoryId === cat.id)
        )
        .reduce((sum, c) => sum + c.weightPercent, 0)
    : 0;

  const remainingWeight = Math.max(totalWeight - usedWeight, 0);

  const currentNumerator = view.config
    ? view.config.categories.reduce((sum, cat) => {
        const catRecords = view.records.filter(
          (r) => r.categoryId === cat.id
        );
        if (catRecords.length === 0) return sum;
        const avg =
          catRecords.reduce((s, r) => s + r.scorePercent, 0) /
          catRecords.length;
        return sum + avg * cat.weightPercent;
      }, 0)
    : 0;

  // pick goalPercent based on letter, or manual override
  let goalPercent: number | null = null;
  if (goalPercentOverride) {
    goalPercent = Number(goalPercentOverride) || null;
  } else if (goalLetter && view.course.gradingScale.length > 0) {
    const match = view.course.gradingScale.find(
      (g) => g.letter === goalLetter
    );
    goalPercent = match ? match.minPercent : null;
  }

  let neededAverage: number | null = null;
  if (
    goalPercent !== null &&
    remainingWeight > 0 &&
    totalWeight > 0
  ) {
    // equation: (currentNumerator + x * remainingWeight) / totalWeight = goalPercent
    // -> x = (goalPercent * totalWeight - currentNumerator) / remainingWeight
    neededAverage =
      (goalPercent * totalWeight - currentNumerator) / remainingWeight;
  }

  const currentPercent = computeCoursePercent(view);
  const currentLetter = letterFromPercent(view.course, currentPercent);

  return (
    <div className="border rounded-lg p-3 bg-sky-50 text-xs space-y-2">
      <div className="font-semibold text-sky-900">
        Future Grade Planning
      </div>
      <div className="text-slate-600">
        Current grade:{" "}
        {currentPercent !== null ? currentPercent.toFixed(1) + "%" : "—"}{" "}
        ({currentLetter})
      </div>
      <div className="grid gap-2 md:grid-cols-3 items-end">
        <div>
          <label className="block mb-1 text-sky-900">
            Desired letter grade
          </label>
          <select
            className="border rounded px-2 py-1 w-full border-sky-300"
            value={goalLetter}
            onChange={(e) => setGoalLetter(e.target.value)}
          >
            <option value="">Select</option>
            {view.course.gradingScale.map((g) => (
              <option key={g.letter} value={g.letter}>
                {g.letter} (≥ {g.minPercent}%)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sky-900">
            or desired % directly
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="border rounded px-2 py-1 w-full border-sky-300"
            value={goalPercentOverride}
            onChange={(e) => setGoalPercentOverride(e.target.value)}
            placeholder="e.g. 93"
          />
        </div>
        <div>
          <label className="block mb-1 text-sky-900">
            Needed avg on remaining work
          </label>
          <div className="font-semibold">
            {remainingWeight === 0
              ? "No remaining work"
              : goalPercent === null
              ? "Set a goal above"
              : neededAverage === null
              ? "—"
              : `${neededAverage.toFixed(1)}%`}
          </div>
          <div className="text-[11px] text-slate-500">
            Remaining weight: {remainingWeight}% of course grade.
          </div>
        </div>
      </div>
    </div>
  );
}

