"use client";

import {
  getNoticeBoard,
  getStudentNoticeBoard,
  publishNotice,
  type NoticeBoardResponse,
  type NoticeStudent,
  type StudentNoticeBoardResponse,
} from "@/lib/api";
import { clearSession, getSession, type AuthSession } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DashboardRole = "student" | "teacher" | "staff";
type DashboardPage = "overview" | "classrooms" | "notices" | "students" | "settings";

type PortalDashboardProps = {
  role: DashboardRole;
};

const roleCopy: Record<DashboardRole, { title: string; subtitle: string; action: string }> = {
  student: {
    title: "Student Dashboard",
    subtitle: "Track your classrooms, notices, and academic activity.",
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

const classroomId = "CSE-3204";

export default function PortalDashboard({ role }: PortalDashboardProps) {
  const router = useRouter();
  const [activePage, setActivePage] = useState<DashboardPage>("overview");
  const [noticeTitle, setNoticeTitle] = useState("SDP Lab Evaluation");
  const [noticeMessage, setNoticeMessage] = useState(
    "Observer pattern assignment will be checked this week.",
  );
  const [noticeBoard, setNoticeBoard] = useState<NoticeBoardResponse | null>(null);
  const [studentNoticeBoard, setStudentNoticeBoard] =
    useState<StudentNoticeBoardResponse | null>(null);
  const [status, setStatus] = useState("Loading classroom notice board...");
  const [isPublishing, setIsPublishing] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const copy = roleCopy[role];
  const canPublish = role !== "student";
  const visibleStudents = useMemo<NoticeStudent[]>(() => {
    if (role === "student") {
      return studentNoticeBoard?.student ? [studentNoticeBoard.student] : [];
    }

    return noticeBoard?.students ?? [];
  }, [noticeBoard, role, studentNoticeBoard]);

  const enrolledStudents = useMemo(
    () => visibleStudents.filter((student) => student.enrolled),
    [visibleStudents],
  );

  const menuItems: Array<{ key: DashboardPage; label: string }> =
    role === "student"
      ? [
          { key: "overview", label: "Overview" },
          { key: "classrooms", label: "Classrooms" },
          { key: "notices", label: "My Notices" },
          { key: "settings", label: "Settings" },
        ]
      : [
          { key: "overview", label: "Overview" },
          { key: "classrooms", label: "Classrooms" },
          { key: "notices", label: "Notices" },
          { key: "students", label: "Students" },
          { key: "settings", label: "Settings" },
        ];

  useEffect(() => {
    const activeSession = getSession();

    if (!activeSession || activeSession.role !== role) {
      router.replace("/signin");
      return;
    }

    setSession(activeSession);
    setIsAuthorized(true);
  }, [role, router]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    let isMounted = true;
    setStatus("Loading classroom notice board...");

    const request =
      role === "student"
        ? getStudentNoticeBoard(classroomId, session?.university_id ?? "")
        : getNoticeBoard(classroomId);

    request
      .then((data) => {
        if (!isMounted) {
          return;
        }

        if (role === "student") {
          setStudentNoticeBoard(data as StudentNoticeBoardResponse);
          setNoticeBoard(null);
        } else {
          setNoticeBoard(data as NoticeBoardResponse);
          setStudentNoticeBoard(null);
        }

        setStatus("Connected to backend notice board.");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        setStatus(error instanceof Error ? error.message : "Backend connection failed.");
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthorized, role, session?.university_id]);

  async function handlePublishNotice() {
    setIsPublishing(true);
    setStatus("Publishing notice through backend...");

    try {
      const data = await publishNotice(
        classroomId,
        noticeTitle.trim() || "Classroom Notice",
        noticeMessage.trim() || "A new classroom notice was posted.",
      );
      setNoticeBoard(data);
      setStatus("Notice published and enrolled students were notified.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not publish notice.");
    } finally {
      setIsPublishing(false);
    }
  }

  if (!isAuthorized) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1 className="text-2xl font-black tracking-normal">Checking session</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
            Redirecting to sign in if this role is not active.
          </p>
        </section>
      </main>
    );
  }

  function renderPage() {
    if (activePage === "overview") {
      return <OverviewPage role={role} copy={copy} noticeBoard={noticeBoard} student={studentNoticeBoard?.student} />;
    }

    if (activePage === "classrooms") {
      return <ClassroomsPage role={role} student={studentNoticeBoard?.student} enrolledCount={enrolledStudents.length} />;
    }

    if (activePage === "notices") {
      return (
        <NoticesPage
          role={role}
          canPublish={canPublish}
          noticeTitle={noticeTitle}
          noticeMessage={noticeMessage}
          status={status}
          isPublishing={isPublishing}
          students={visibleStudents}
          onTitleChange={setNoticeTitle}
          onMessageChange={setNoticeMessage}
          onPublish={handlePublishNotice}
        />
      );
    }

    if (activePage === "students" && role !== "student") {
      return <StudentsPage students={visibleStudents} enrolledCount={enrolledStudents.length} />;
    }

    return <SettingsPage role={role} />;
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
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActivePage(item.key)}
                className={
                  activePage === item.key
                    ? "sidebar-link sidebar-link-active w-full text-left"
                    : "sidebar-link w-full text-left"
                }
              >
                {item.label}
              </button>
            ))}
          </nav>

          <Link
            href="/signin"
            className="secondary-button mt-6 w-full justify-center"
            onClick={() => clearSession()}
          >
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
              {session?.name ? `${copy.title} / ${session.name}` : copy.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--campus-paper)_76%,white)]">
                {copy.subtitle}
              </p>
            </div>
            <span className="status-pill">{classroomId} / SDP Lab</span>
          </header>

          <div className="py-5">{renderPage()}</div>
        </section>
      </div>
    </main>
  );
}

function OverviewPage({
  role,
  copy,
  noticeBoard,
  student,
}: {
  role: DashboardRole;
  copy: { action: string };
  noticeBoard: NoticeBoardResponse | null;
  student?: NoticeStudent;
}) {
  const metrics =
    role === "student"
      ? [
          ["Classroom", classroomId, "Software Development Project Lab"],
          ["My notices", String(student?.notification_count ?? 0), "Received in your inbox"],
          ["My status", student?.enrolled ? "Subscribed" : "Paused", "Classroom notice access"],
          ["Role", "Student", copy.action],
        ]
      : [
          ["Classroom", classroomId, "Software Development Project Lab"],
          ["Enrolled", String(noticeBoard?.enrolled_student_count ?? 0), "Students receiving notices"],
          ["Notices", String(noticeBoard?.notice_count ?? 0), "Published through backend"],
          ["Role", role[0].toUpperCase() + role.slice(1), copy.action],
        ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, detail]) => (
        <article key={label} className="metric">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--campus-muted)]">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black">{value}</p>
          <p className="mt-2 text-sm font-semibold text-[var(--campus-muted)]">{detail}</p>
        </article>
      ))}
    </div>
  );
}

function ClassroomsPage({
  role,
  student,
  enrolledCount,
}: {
  role: DashboardRole;
  student?: NoticeStudent;
  enrolledCount: number;
}) {
  return (
    <section className="panel">
      <h2 className="section-title">Classrooms</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
        {role === "student"
          ? "Your enrolled classroom and notice subscription status."
          : "Active classroom sections managed in this portal."}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-md border border-[var(--campus-border)] bg-[rgba(255,248,230,0.68)] p-4">
          <p className="text-lg font-black">{classroomId}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--campus-muted)]">
            Software Development Project Lab
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="status-pill">Semester 3-2</span>
            <span className="status-pill">CSE</span>
            {role === "student" ? (
              <span className="status-pill">{student?.enrolled ? "Subscribed" : "Paused"}</span>
            ) : (
              <span className="status-pill">{enrolledCount} students</span>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function NoticesPage({
  role,
  canPublish,
  noticeTitle,
  noticeMessage,
  status,
  isPublishing,
  students,
  onTitleChange,
  onMessageChange,
  onPublish,
}: {
  role: DashboardRole;
  canPublish: boolean;
  noticeTitle: string;
  noticeMessage: string;
  status: string;
  isPublishing: boolean;
  students: NoticeStudent[];
  onTitleChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onPublish: () => void;
}) {
  const student = students[0];

  return (
    <div className={role === "student" ? "grid gap-5" : "grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"}>
      <section className="panel">
        <h2 className="section-title">{role === "student" ? "My Classroom Notices" : "Classroom Notice Board"}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
          {canPublish
            ? "Publish a notice and all subscribed students receive it immediately."
            : "Only your own classroom inbox is visible here."}
        </p>

        {canPublish ? (
          <div className="mt-5 space-y-3">
            <label className="field-label" htmlFor="notice-title">
              Notice title
            </label>
            <input
              id="notice-title"
              value={noticeTitle}
              onChange={(event) => onTitleChange(event.target.value)}
              className="field"
            />

            <label className="field-label" htmlFor="notice-message">
              Message
            </label>
            <textarea
              id="notice-message"
              value={noticeMessage}
              onChange={(event) => onMessageChange(event.target.value)}
              className="field min-h-28 resize-none"
            />

            <button type="button" className="primary-button" onClick={onPublish} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish notice"}
            </button>
          </div>
        ) : (
          <StudentInbox student={student} />
        )}

        <div className="mt-4 rounded-md bg-[var(--campus-blue-soft)] p-4 text-sm font-bold text-[var(--campus-blue)]">
          {status}
        </div>
      </section>

      {canPublish ? <StudentsInboxList students={students} /> : null}
    </div>
  );
}

function StudentsPage({
  students,
  enrolledCount,
}: {
  students: NoticeStudent[];
  enrolledCount: number;
}) {
  return (
    <section className="panel">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="section-title">Enrolled Students</h2>
          <p className="mt-2 text-sm text-[var(--campus-muted)]">
            Students marked On are subscribed to classroom notices.
          </p>
        </div>
        <span className="status-pill">{enrolledCount} active</span>
      </div>

      <div className="mt-4">
        <StudentsInboxList students={students} />
      </div>
    </section>
  );
}

function SettingsPage({ role }: { role: DashboardRole }) {
  return (
    <section className="panel">
      <h2 className="section-title">Settings</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
        Portal preferences for the {role} account.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="display-name">
            Display name
          </label>
          <input id="display-name" className="field mt-2" defaultValue="CSEDU User" />
        </div>
        <div>
          <label className="field-label" htmlFor="notification-email">
            Notification email
          </label>
          <input id="notification-email" className="field mt-2" defaultValue="user@university.edu" />
        </div>
      </div>
    </section>
  );
}

function StudentInbox({ student }: { student?: NoticeStudent }) {
  return (
    <article className="mt-5 rounded-md border border-[var(--campus-border)] bg-[rgba(255,248,230,0.68)] p-4">
      <p className="text-sm font-black">{student?.name ?? "Student inbox"}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--campus-muted)]">
        {student?.student_id ?? "No active student session"}
      </p>
      <p className="mt-4 text-sm font-bold">
        {student?.notification_count ?? 0} notice{student?.notification_count === 1 ? "" : "s"}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
        {student?.latest_notification ?? "No notice received yet."}
      </p>
    </article>
  );
}

function StudentsInboxList({ students }: { students: NoticeStudent[] }) {
  return (
    <div className="space-y-3">
      {students.map((student) => (
        <article key={student.student_id} className="student-row">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              disabled
              aria-label={`${student.name} notice subscription status`}
              className={student.enrolled ? "enrollment enrollment-active" : "enrollment"}
            >
              {student.enrolled ? "On" : "Off"}
            </button>
            <div className="min-w-0">
              <p className="truncate font-bold">{student.name}</p>
              <p className="truncate text-xs font-semibold text-[var(--campus-muted)]">
                {student.student_id} / {student.email}
              </p>
            </div>
          </div>
          <div className="rounded-md bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--campus-muted)]">
              Inbox
            </p>
            <p className="mt-1 text-sm font-bold">
              {student.notification_count} notice{student.notification_count === 1 ? "" : "s"}
            </p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--campus-muted)]">
              {student.latest_notification ?? "No notice received yet."}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
