"use client";

import { loginUser } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type Role = "student" | "teacher" | "staff";

const demoCredentials: Record<Role, { email: string; id: string; password: string }> = {
  student: {
    email: "rahim@student.example.com",
    id: "S-2026-001",
    password: "student123",
  },
  teacher: {
    email: "nusrat@teacher.example.com",
    id: "T-102",
    password: "teacher123",
  },
  staff: {
    email: "kamal@staff.example.com",
    id: "ST-17",
    password: "staff123",
  },
};

export default function SignInPage() {
  const [role, setRole] = useState<Role>("student");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const selectedDemo = demoCredentials[role];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Checking credentials with backend...");

    const formData = new FormData(event.currentTarget);

    try {
      const result = await loginUser({
        user_type: role,
        email: String(formData.get("email") ?? ""),
        university_id: String(formData.get("university_id") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      saveSession({
        role,
        name: result.name,
        email: result.email,
        university_id: result.university_id,
      });
      setStatus(result.message);
      router.push(result.dashboard_route);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="text-sm font-black text-[var(--campus-teal)]">
          CSEDU University Management
        </Link>
        <h1 className="mt-5 text-3xl font-black tracking-normal">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
          Select your role and use matching credentials. A student ID cannot enter the teacher
          portal.
        </p>

        <div className="segmented mt-6">
          {(["student", "teacher", "staff"] as Role[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setRole(item);
                setStatus(null);
              }}
              className={role === item ? "segment segment-active" : "segment"}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              key={`${role}-email`}
              id="email"
              name="email"
              type="email"
              className="field mt-2"
              defaultValue={selectedDemo.email}
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="university-id">
              University ID
            </label>
            <input
              key={`${role}-id`}
              id="university-id"
              name="university_id"
              className="field mt-2"
              defaultValue={selectedDemo.id}
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              key={`${role}-password`}
              id="password"
              name="password"
              type="password"
              className="field mt-2"
              defaultValue={selectedDemo.password}
              required
            />
          </div>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : `Continue as ${role}`}
          </button>
        </form>

        {status ? (
          <div className="mt-5 rounded-md bg-[var(--campus-blue-soft)] p-4 text-sm font-bold text-[var(--campus-blue)]">
            {status}
          </div>
        ) : null}

        <div className="mt-5 flex justify-between text-sm font-bold">
          <Link href="/forget" className="text-[var(--campus-teal)]">
            Forgot password?
          </Link>
          <Link href="/signup" className="text-[var(--campus-teal)]">
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
