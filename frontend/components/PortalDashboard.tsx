"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DashboardRole = "student" | "teacher" | "staff";

type PortalDashboardProps = {
  role: DashboardRole;
};

type Student = {
  id: string;
  name: string;
  department: string;
  semester: string;
  enrolled: boolean;
  notifications: string[];
};

const roleCopy: Record<DashboardRole, { title: string; subtitle: string; action: string }> = {
  student: {
    title: "Student Dashboard",
    subtitle: "Track enrolled classrooms, notices, and academic activity.",
    action: "View notices",
  },
  teacher: {
    title: "Teacher Dashboard",
    subtitle: "Publish classroom notices and monitor enrolled students.",
    action: "Publish notice",
  },
  staff: {
    title: "Staff Dashboard",
    subtitle: "Review users, classroom operations, and notice activity.",
    action: "Review activity",
  },
};

const initialStudents: Student[] = [
  {
    id: "S-2026-001",
    name: "Rahim Uddin",
    department: "CSE",
    semester: "3-2",
    enrolled: true,
    notifications: [],
  },
  {
    id: "S-2026-002",
    name: "Karim Ahmed",
    department: "CSE",
    semester: "3-2",
    enrolled: true,
    notifications: [],
  },
  {
    id: "S-2026-003",
    name: "Nabila Islam",
    department: "CSE",
    semester: "3-2",
    enrolled: true,
    notifications: [],
  },
];

export default function PortalDashboard({ role }: PortalDashboardProps) {
  const [noticeTitle, setNoticeTitle] = useState("SDP Lab Evaluation");
  const [noticeMessage, setNoticeMessage] = useState(
    "Observer pattern assignment will be checked this week.",
  );
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [noticeCount, setNoticeCount] = useState(0);

  const enrolledStudents = useMemo(
    () => students.filter((student) => student.enrolled),
    [students],
  );

  const copy = roleCopy[role];
  const canPublish = role !== "student";

  function toggleEnrollment(studentId: string) {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === studentId
          ? { ...student, enrolled: !student.enrolled }
          : student,
      ),
    );
  }

  function publishNotice() {
    const title = noticeTitle.trim() || "Classroom Notice";
    const message = noticeMessage.trim() || "A new classroom notice was posted.";
    const notification = `${title}: ${message}`;

    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.enrolled
          ? { ...student, notifications: [notification, ...student.notifications] }
          : student,
      ),
    );
    setNoticeCount((currentCount) => currentCount + 1);
  }

  return (
    <main className="min-h-screen bg-[var(--campus-bg)] text-[var(--campus-ink)]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-[var(--campus-border)] bg-white px-5 py-5">
          <Link href="/" className="block rounded-md bg-[var(--campus-teal)] px-4 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
              UMS
            </p>
            <p className="mt-1 text-xl font-black tracking-normal">University Management</p>
          </Link>

          <nav className="mt-6 space-y-2 text-sm font-bold">
            {["Overview", "Classrooms", "Notices", "Students", "Settings"].map((item, index) => (
              <a
                key={item}
                href={index === 0 ? "#overview" : `#${item.toLowerCase()}`}
                className={index === 0 ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              >
                {item}
              </a>
            ))}
          </nav>

          <Link href="/signin" className="secondary-button mt-6 w-full justify-center">
            Sign out
          </Link>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6">
          <header className="flex flex-col gap-4 border-b border-[rgba(243,236,216,0.2)] pb-5 text-[var(--campus-paper-strong)] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--campus-amber)]">
                {role.toUpperCase()} PORTAL
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-normal sm:text-3xl">
                {copy.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--campus-paper)_76%,white)]">
                {copy.subtitle}
              </p>
            </div>
            <span className="status-pill">CSE-3204 / SDP Lab</span>
          </header>

          <div id="overview" className="grid gap-4 py-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Classroom", "CSE-3204", "Software Development Project Lab"],
              ["Enrolled", String(enrolledStudents.length), "Students receiving notices"],
              ["Notices", String(noticeCount), "Published this session"],
              ["Role", role[0].toUpperCase() + role.slice(1), copy.action],
            ].map(([label, value, detail]) => (
              <article key={label} className="metric">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--campus-muted)]">
                  {label}
                </p>
                <p className="mt-3 text-2xl font-black">{value}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--campus-muted)]">
                  {detail}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="panel" id="notices">
              <h2 className="section-title">Classroom Notice Board</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
                {canPublish
                  ? "Publish a notice and all subscribed students receive it immediately."
                  : "Latest classroom notices appear here as soon as they are posted."}
              </p>

              <div className="mt-5 space-y-3">
                <label className="field-label" htmlFor="notice-title">
                  Notice title
                </label>
                <input
                  id="notice-title"
                  value={noticeTitle}
                  onChange={(event) => setNoticeTitle(event.target.value)}
                  className="field"
                  readOnly={!canPublish}
                />

                <label className="field-label" htmlFor="notice-message">
                  Message
                </label>
                <textarea
                  id="notice-message"
                  value={noticeMessage}
                  onChange={(event) => setNoticeMessage(event.target.value)}
                  className="field min-h-28 resize-none"
                  readOnly={!canPublish}
                />

                {canPublish ? (
                  <button type="button" className="primary-button" onClick={publishNotice}>
                    Publish notice
                  </button>
                ) : (
                  <div className="rounded-md bg-[var(--campus-blue-soft)] p-4 text-sm font-bold text-[var(--campus-blue)]">
                    Student view is read-only.
                  </div>
                )}
              </div>
            </section>

            <section className="panel" id="students">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="section-title">Enrolled Students</h2>
                  <p className="mt-2 text-sm text-[var(--campus-muted)]">
                    Students marked On are subscribed to classroom notices.
                  </p>
                </div>
                <span className="status-pill">{enrolledStudents.length} active</span>
              </div>

              <div className="mt-4 space-y-3">
                {students.map((student) => (
                  <article key={student.id} className="student-row">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        disabled={role === "student"}
                        aria-label={
                          student.enrolled
                            ? `Pause notices for ${student.name}`
                            : `Subscribe ${student.name}`
                        }
                        onClick={() => toggleEnrollment(student.id)}
                        className={
                          student.enrolled ? "enrollment enrollment-active" : "enrollment"
                        }
                      >
                        {student.enrolled ? "On" : "Off"}
                      </button>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{student.name}</p>
                        <p className="truncate text-xs font-semibold text-[var(--campus-muted)]">
                          {student.id} / {student.department} / {student.semester}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--campus-muted)]">
                        Inbox
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {student.notifications.length} notice
                        {student.notifications.length === 1 ? "" : "s"}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--campus-muted)]">
                        {student.notifications[0] ?? "No notice received yet."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
