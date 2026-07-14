"use client";

import { registerUser } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type Role = "student" | "teacher" | "staff";

const roleFields: Record<Role, { idLabel: string; extraLabel: string; dashboard: string }> = {
  student: { idLabel: "Student ID", extraLabel: "Semester", dashboard: "/student/dashboard" },
  teacher: { idLabel: "Teacher ID", extraLabel: "Designation", dashboard: "/teacher/dashboard" },
  staff: { idLabel: "Staff ID", extraLabel: "Office", dashboard: "/staff/dashboard" },
};

export default function SignUpPage() {
  const [role, setRole] = useState<Role>("student");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const selectedRole = roleFields[role];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Creating account through backend...");

    const formData = new FormData(event.currentTarget);

    try {
      const result = await registerUser({
        user_type: role,
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        university_id: String(formData.get("university_id") ?? ""),
        department: String(formData.get("department") ?? "CSE"),
        extra: String(formData.get("extra") ?? ""),
      });

      setStatus(
        result.database_saved
          ? `${result.welcome_message} Saved to ${result.collection_name}.`
          : `${result.welcome_message} Backend connected, database save skipped.`,
      );
      saveSession({
        role,
        name: result.name,
        email: result.email,
        university_id: result.university_id,
      });
      router.push(result.dashboard_route);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="field-label" htmlFor="name">
              Full name
            </label>
            <input id="name" name="name" className="field mt-2" placeholder="Enter full name" required />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="field mt-2" placeholder="name@university.edu" required />
          </div>
          <div>
            <label className="field-label" htmlFor="id">
              {selectedRole.idLabel}
            </label>
            <input id="id" name="university_id" className="field mt-2" placeholder="University ID" required />
          </div>
          <div>
            <label className="field-label" htmlFor="department">
              Department
            </label>
            <input id="department" name="department" className="field mt-2" defaultValue="CSE" required />
          </div>
          <div>
            <label className="field-label" htmlFor="extra">
              {selectedRole.extraLabel}
            </label>
            <input id="extra" name="extra" className="field mt-2" required />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" className="field mt-2" required />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register account"}
            </button>
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

        {status ? (
          <div className="mt-5 rounded-md bg-[var(--campus-blue-soft)] p-4 text-sm font-bold text-[var(--campus-blue)]">
            {status}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href="/signin" className="secondary-button">
            Already have an account
          </Link>
        </div>
      </section>
    </main>
  );
}
