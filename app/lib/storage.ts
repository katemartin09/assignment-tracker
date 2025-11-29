// app/lib/storage.ts

// ---- Types ----
export type AssignmentStatus =
  | "to-start"
  | "in-progress"
  | "submitted"
  | "revision"
  | "done";

export type AssignmentType =
  | "assignment"
  | "exam"
  | "quiz"
  | "lab"
  | "reading"
  | "paper"
  | "project";

export type Course = {
  id: string;
  name: string;
  credits: number;
  // e.g. [{letter: "A", minPercent: 93}, {letter: "A-", minPercent: 90}, ...]
  gradingScale: { letter: string; minPercent: number }[];
};

export type Assignment = {
  id: string;
  courseId: string | null; // link to Course.id or null if none
  subjectName: string; // course name for display
  status: AssignmentStatus;
  type: AssignmentType;
  title: string;
  details: string;
  dueDate: string; // "YYYY-MM-DD"
  createdAt: string; // "YYYY-MM-DD"
};

export type GradeCategory = {
  id: string;
  name: string; // Quizzes, Final, etc.
  weightPercent: number; // 0–100, must sum to 100 per course
};

export type CourseGradeConfig = {
  courseId: string;
  categories: GradeCategory[];
};

export type GradeRecord = {
  id: string;
  assignmentId: string;
  courseId: string;
  categoryId: string;
  scorePercent: number; // 0–100
};

// ---- Keys ----
const COURSES_KEY = "courses_v1";
const ASSIGNMENTS_KEY = "assignments_v2";
const COMPLETED_ASSIGNMENTS_KEY = "completed_assignments_v1";
const GRADE_CONFIG_KEY = "grade_configs_v1";
const GRADE_RECORDS_KEY = "grade_records_v1";

// ---- Generic helpers ----
function safeJSONParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  return safeJSONParse(raw, fallback);
}

function lsSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// ---- Courses ----
export function loadCourses(): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Course[];
  } catch {
    return [];
  }
}

export function saveCourses(courses: Course[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

// ---- Assignments (active) ----
export function loadAssignments(): Assignment[] {
  return lsGet<Assignment[]>(ASSIGNMENTS_KEY, []);
}

export function saveAssignments(assignments: Assignment[]) {
  lsSet(ASSIGNMENTS_KEY, assignments);
}

// ---- Completed assignments (for Grades) ----
export function loadCompletedAssignments(): Assignment[] {
  return lsGet<Assignment[]>(COMPLETED_ASSIGNMENTS_KEY, []);
}

export function saveCompletedAssignments(assignments: Assignment[]) {
  lsSet(COMPLETED_ASSIGNMENTS_KEY, assignments);
}

// ---- Grade configs & records ----
export function loadGradeConfigs(): CourseGradeConfig[] {
  return lsGet<CourseGradeConfig[]>(GRADE_CONFIG_KEY, []);
}

export function saveGradeConfigs(configs: CourseGradeConfig[]) {
  lsSet(COURSE_GRADE_CONFIG_KEY, configs);
}
// minor typo fix: declare constant name
const COURSE_GRADE_CONFIG_KEY = GRADE_CONFIG_KEY;

export function loadGradeRecords(): GradeRecord[] {
  return lsGet<GradeRecord[]>(GRADE_RECORDS_KEY, []);
}

export function saveGradeRecords(records: GradeRecord[]) {
  lsSet(GRADE_RECORDS_KEY, records);
}

// ---- Date helpers ----
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

export function getDaysRemaining(dueDate: string): number {
  if (!dueDate) return NaN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((due.getTime() - today.getTime()) / msPerDay);
}
