export type Assignment = {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  completed: boolean;
};

export function loadAssignments(): Assignment[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("assignments");
  return data ? JSON.parse(data) : [];
}

export function saveAssignments(assignments: Assignment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("assignments", JSON.stringify(assignments));
}
