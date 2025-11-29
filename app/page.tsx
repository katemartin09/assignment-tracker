// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Assignment Tracker</h1>
      <p className="text-slate-600 mb-6 max-w-xl">
        Track your courses, assignments, grades, and semester calendar in one
        place.
      </p>
      <Link
        href="/assignments"
        className="bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Go to Assignments
      </Link>
    </div>
  );
}



