"use client";

import { useEffect, useState } from "react";
import AssignmentForm from "./components/AssignmentForm";
import AssignmentList from "./components/AssignmentList";
import { Assignment, loadAssignments, saveAssignments } from "./lib/storage";

export default function Home() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Load assignments from localStorage on page load
  useEffect(() => {
    setAssignments(loadAssignments());
  }, []);

  // Save whenever assignments change
  useEffect(() => {
    saveAssignments(assignments);
  }, [assignments]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Assignment Tracker</h1>

      <AssignmentForm setAssignments={setAssignments} />
      <AssignmentList assignments={assignments} setAssignments={setAssignments} />
    </div>
  );
}

