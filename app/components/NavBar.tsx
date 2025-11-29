"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/assignments", label: "Assignments" },
  { href: "/grades", label: "Grades" },
  { href: "/calendar", label: "Calendar" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <span className="font-semibold text-xl text-sky-900">
        Assignment Tracker
      </span>
      <div className="flex gap-4 text-sm font-medium">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href === "/assignments" && pathname === "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                "px-3 py-1 rounded-full transition-colors " +
                (active
                  ? "bg-sky-700 text-white"
                  : "text-sky-900 hover:bg-sky-100")
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
