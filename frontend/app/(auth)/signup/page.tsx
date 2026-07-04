"use client";

import Link from "next/link";
import { useState } from "react";

type Role = "student" | "teacher" | "staff";

const roleFields: Record<Role, { idLabel: string; extraLabel: string; dashboard: string }> = {
  student: { idLabel: "Student ID", extraLabel: "Semester", dashboard: "/student/dashboard" },
  teacher: { idLabel: "Teacher ID", extraLabel: "Designation", dashboard: "/teacher/dashboard" },
  staff: { idLabel: "Staff ID", extraLabel: "Office", dashboard: "/staff/dashboard" },
};

export default function SignUpPage() {
  const [role, setRole] = useState<Role>("student");
  const selectedRole = roleFields[role];

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <Link href="/" className="text-sm font-black text-[var(--campus-teal)]">
          CSEDU University Management
        </Link>
        <h1 className="mt-5 text-3xl font-black tracking-normal">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
          Registration changes by role, matching the backend user registration flow.
        </p>

        <div className="segmented mt-6">
          {(["student", "teacher", "staff"] as Role[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={role === item ? "segment segment-active" : "segment"}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <form className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="name">
              Full name
            </label>
            <input id="name" className="field mt-2" placeholder="Enter full name" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" className="field mt-2" placeholder="name@university.edu" />
          </div>
          <div>
            <label className="field-label" htmlFor="id">
              {selectedRole.idLabel}
            </label>
            <input id="id" className="field mt-2" placeholder="University ID" />
          </div>
          <div>
            <label className="field-label" htmlFor="department">
              Department
            </label>
            <input id="department" className="field mt-2" defaultValue="CSE" />
          </div>
          <div>
            <label className="field-label" htmlFor="extra">
              {selectedRole.extraLabel}
            </label>
            <input id="extra" className="field mt-2" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input id="password" type="password" className="field mt-2" />
          </div>
        </form>

        <div className="mt-5 rounded-md bg-[var(--campus-green-soft)] p-4">
          <p className="text-sm font-black text-[var(--campus-green)]">
            After registration: {selectedRole.dashboard}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[var(--campus-muted)]">
            The backend creates the correct profile and validation policy from the selected role.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={selectedRole.dashboard} className="primary-link">
            Register account
          </Link>
          <Link href="/signin" className="secondary-button">
            Already have an account
          </Link>
        </div>
      </section>
    </main>
  );
}
