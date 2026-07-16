"use client";

import {
  calculateStudentPolicy,
  createClassroom,
  getNoticeBoard,
  getClassrooms,
  getStudentNoticeBoard,
  joinClassroom,
  publishNotice,
  type ClassroomSummary,
  type NoticeBoardResponse,
  type NoticeStudent,
  type StudentPolicyCalculationPayload,
  type StudentPolicyCalculationResponse,
  type StudentNoticeBoardResponse,
} from "@/lib/api";
import { clearSession, getSession, type AuthSession } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DashboardRole = "student" | "teacher" | "staff";
type DashboardPage =
  | "overview"
  | "classrooms"
  | "notices"
  | "students"
  | "results"
  | "fees"
  | "policy"
  | "settings";
type NumericPolicyField =
  | "exam_score"
  | "lab_score"
  | "assignment_score"
  | "attendance_score"
  | "viva_score"
  | "base_fee";

type PortalDashboardProps = {
  role: DashboardRole;
};

type StudentSubjectRecord = {
  code: string;
  title: string;
  credit: number;
  examScore: number;
  labScore: number;
  assignmentScore: number;
  attendanceScore: number;
  finalScore: number;
  letterGrade: string;
  status: "Passed" | "Failed" | "In progress";
  extraFee: number;
};

type StudentFeeRecord = {
  semesterFee: number;
  scholarship: number;
  failedCourseFee: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: "Paid" | "Partial" | "Due";
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
const scoreFields: Array<{ key: NumericPolicyField; label: string }> = [
  { key: "exam_score", label: "Exam score" },
  { key: "lab_score", label: "Lab score" },
  { key: "assignment_score", label: "Assignment score" },
  { key: "attendance_score", label: "Attendance score" },
  { key: "viva_score", label: "Viva score" },
  { key: "base_fee", label: "Base semester fee" },
];

const initialPolicyForm: StudentPolicyCalculationPayload = {
  student_id: "S-2026-001",
  student_name: "Rahim Uddin",
  course_id: classroomId,
  grade_policy: "lab_course",
  fee_policy: "merit",
  exam_score: 78,
  lab_score: 88,
  assignment_score: 82,
  attendance_score: 90,
  viva_score: 84,
  base_fee: 25000,
};

const studentSubjectRecords: StudentSubjectRecord[] = [
  {
    code: "CSE-3201",
    title: "Software Engineering",
    credit: 3,
    examScore: 82,
    labScore: 0,
    assignmentScore: 86,
    attendanceScore: 94,
    finalScore: 84.0,
    letterGrade: "A+",
    status: "Passed",
    extraFee: 0,
  },
  {
    code: "CSE-3204",
    title: "Software Development Project Lab",
    credit: 1.5,
    examScore: 78,
    labScore: 88,
    assignmentScore: 82,
    attendanceScore: 90,
    finalScore: 86.2,
    letterGrade: "A+",
    status: "In progress",
    extraFee: 0,
  },
  {
    code: "CSE-3207",
    title: "Database Management Systems",
    credit: 3,
    examScore: 42,
    labScore: 0,
    assignmentScore: 48,
    attendanceScore: 72,
    finalScore: 48.4,
    letterGrade: "F",
    status: "Failed",
    extraFee: 2500,
  },
  {
    code: "CSE-3211",
    title: "Computer Networks",
    credit: 3,
    examScore: 68,
    labScore: 72,
    assignmentScore: 78,
    attendanceScore: 85,
    finalScore: 72.1,
    letterGrade: "A",
    status: "In progress",
    extraFee: 0,
  },
];

const failedCourseFee = studentSubjectRecords.reduce((total, subject) => total + subject.extraFee, 0);

const studentFeeRecord: StudentFeeRecord = {
  semesterFee: 25000,
  scholarship: 7500,
  failedCourseFee,
  paidAmount: 12000,
  dueAmount: 5500 + failedCourseFee,
  dueDate: "2026-08-15",
  status: "Partial",
};

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
  const [policyStatus, setPolicyStatus] = useState("Choose policies and calculate the result.");
  const [policyForm, setPolicyForm] = useState<StudentPolicyCalculationPayload>(initialPolicyForm);
  const [policyResult, setPolicyResult] = useState<StudentPolicyCalculationResponse | null>(null);
  const [isCalculatingPolicy, setIsCalculatingPolicy] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [classroomStatus, setClassroomStatus] = useState("Loading classrooms...");
  const [joinCode, setJoinCode] = useState("SDP3204");
  const [newClassroomTitle, setNewClassroomTitle] = useState("Artificial Intelligence");
  const [newClassroomCode, setNewClassroomCode] = useState("CSE-4201");
  const [isClassroomBusy, setIsClassroomBusy] = useState(false);
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
          { key: "results", label: "Results" },
          { key: "fees", label: "Fees" },
          { key: "notices", label: "My Notices" },
          { key: "settings", label: "Settings" },
        ]
      : [
          { key: "overview", label: "Overview" },
          { key: "classrooms", label: "Classrooms" },
          { key: "notices", label: "Notices" },
          { key: "students", label: "Students" },
          { key: "policy", label: "Policy Calculator" },
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

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    let isMounted = true;
    setClassroomStatus("Loading classrooms...");

    getClassrooms(role === "student" ? session?.university_id : undefined)
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setClassrooms(data);
        setClassroomStatus("Classrooms loaded.");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        setClassroomStatus(error instanceof Error ? error.message : "Could not load classrooms.");
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

  async function handleCalculatePolicy() {
    setIsCalculatingPolicy(true);
    setPolicyStatus("Calculating grade and fee policies...");

    try {
      const data = await calculateStudentPolicy(policyForm);
      setPolicyResult(data);
      setPolicyStatus("Strategy policies applied successfully.");
    } catch (error) {
      setPolicyStatus(error instanceof Error ? error.message : "Could not calculate policies.");
    } finally {
      setIsCalculatingPolicy(false);
    }
  }

  async function handleCreateClassroom() {
    setIsClassroomBusy(true);
    setClassroomStatus("Creating classroom...");

    try {
      const classroom = await createClassroom({
        title: newClassroomTitle.trim() || newClassroomCode.trim(),
        course_code: newClassroomCode.trim(),
        teacher_name: session?.name ?? "Course Teacher",
      });
      setClassrooms((items) => [...items, classroom]);
      setClassroomStatus(`Created ${classroom.course_code}. Invite code: ${classroom.invite_code}`);
    } catch (error) {
      setClassroomStatus(error instanceof Error ? error.message : "Could not create classroom.");
    } finally {
      setIsClassroomBusy(false);
    }
  }

  async function handleJoinClassroom() {
    setIsClassroomBusy(true);
    setClassroomStatus("Joining classroom...");

    try {
      const data = await joinClassroom({
        invite_code: joinCode.trim(),
        student_id: session?.university_id ?? "S-2026-001",
        student_name: session?.name ?? "Student",
        student_email: session?.email ?? "student@example.com",
      });
      setClassrooms((items) => {
        const exists = items.some((item) => item.classroom_id === data.classroom.classroom_id);
        if (!exists) {
          return [...items, data.classroom];
        }
        return items.map((item) =>
          item.classroom_id === data.classroom.classroom_id ? data.classroom : item,
        );
      });
      setClassroomStatus(data.message);
    } catch (error) {
      setClassroomStatus(error instanceof Error ? error.message : "Could not join classroom.");
    } finally {
      setIsClassroomBusy(false);
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
      return (
        <ClassroomsPage
          role={role}
          classrooms={classrooms}
          student={studentNoticeBoard?.student}
          enrolledCount={enrolledStudents.length}
          status={classroomStatus}
          joinCode={joinCode}
          newClassroomTitle={newClassroomTitle}
          newClassroomCode={newClassroomCode}
          isBusy={isClassroomBusy}
          onJoinCodeChange={setJoinCode}
          onNewTitleChange={setNewClassroomTitle}
          onNewCodeChange={setNewClassroomCode}
          onJoin={handleJoinClassroom}
          onCreate={handleCreateClassroom}
        />
      );
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

    if (activePage === "results" && role === "student") {
      return (
        <StudentResultsPage
          session={session}
          subjects={studentSubjectRecords}
        />
      );
    }

    if (activePage === "fees" && role === "student") {
      return <StudentFeesPage subjects={studentSubjectRecords} fee={studentFeeRecord} />;
    }

    if (activePage === "students" && role !== "student") {
      return <StudentsPage students={visibleStudents} enrolledCount={enrolledStudents.length} />;
    }

    if (activePage === "policy" && role !== "student") {
      return (
        <PolicyCalculatorPage
          form={policyForm}
          result={policyResult}
          status={policyStatus}
          isCalculating={isCalculatingPolicy}
          onFormChange={setPolicyForm}
          onCalculate={handleCalculatePolicy}
        />
      );
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
  const averageScore =
    studentSubjectRecords.reduce((total, subject) => total + subject.finalScore, 0) /
    studentSubjectRecords.length;
  const metrics =
    role === "student"
      ? [
          ["Classroom", classroomId, "Software Development Project Lab"],
          ["Subjects", String(studentSubjectRecords.length), "Current semester courses"],
          ["Average", averageScore.toFixed(1), "Across published marks"],
          ["Fee due", `Tk ${studentFeeRecord.dueAmount}`, `${studentFeeRecord.status} payment status`],
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
  classrooms,
  student,
  enrolledCount,
  status,
  joinCode,
  newClassroomTitle,
  newClassroomCode,
  isBusy,
  onJoinCodeChange,
  onNewTitleChange,
  onNewCodeChange,
  onJoin,
  onCreate,
}: {
  role: DashboardRole;
  classrooms: ClassroomSummary[];
  student?: NoticeStudent;
  enrolledCount: number;
  status: string;
  joinCode: string;
  newClassroomTitle: string;
  newClassroomCode: string;
  isBusy: boolean;
  onJoinCodeChange: (value: string) => void;
  onNewTitleChange: (value: string) => void;
  onNewCodeChange: (value: string) => void;
  onJoin: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="panel">
        <h2 className="section-title">Classrooms</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
          {role === "student"
            ? "Join teacher-created classrooms using an invite code."
            : "Create classrooms and share invite codes with students."}
        </p>

        {role === "student" ? (
          <div className="mt-5 space-y-3">
            <label className="field-label" htmlFor="join-code">
              Invite code
            </label>
            <input
              id="join-code"
              value={joinCode}
              onChange={(event) => onJoinCodeChange(event.target.value.toUpperCase())}
              className="field"
            />
            <button type="button" className="primary-button" onClick={onJoin} disabled={isBusy}>
              {isBusy ? "Joining..." : "Join classroom"}
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            <div>
              <label className="field-label" htmlFor="new-classroom-title">
                Classroom title
              </label>
              <input
                id="new-classroom-title"
                value={newClassroomTitle}
                onChange={(event) => onNewTitleChange(event.target.value)}
                className="field mt-2"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="new-classroom-code">
                Course code
              </label>
              <input
                id="new-classroom-code"
                value={newClassroomCode}
                onChange={(event) => onNewCodeChange(event.target.value.toUpperCase())}
                className="field mt-2"
              />
            </div>
            <button type="button" className="primary-button" onClick={onCreate} disabled={isBusy}>
              {isBusy ? "Creating..." : "Create classroom"}
            </button>
          </div>
        )}

        <div className="mt-4 rounded-md bg-[var(--campus-blue-soft)] p-4 text-sm font-bold text-[var(--campus-blue)]">
          {status}
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title">{role === "student" ? "My Classrooms" : "Managed Classrooms"}</h2>
            <p className="mt-2 text-sm text-[var(--campus-muted)]">
              {role === "student"
                ? "Joined classrooms show as active for notices."
                : "Share the invite code with students so they can join."}
            </p>
          </div>
          <span className="status-pill">
            {role === "student" ? student?.student_id ?? "Student" : `${enrolledCount} notice students`}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {classrooms.map((classroom) => (
            <article key={classroom.classroom_id} className="student-row">
              <div className="min-w-0">
                <p className="font-black">{classroom.course_code}</p>
                <p className="mt-1 truncate text-sm font-semibold text-[var(--campus-muted)]">
                  {classroom.title}
                </p>
                <p className="mt-1 text-xs font-bold text-[var(--campus-muted)]">
                  Teacher: {classroom.teacher_name}
                </p>
              </div>
              <div className="rounded-md bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--campus-muted)]">
                  Invite
                </p>
                <p className="mt-1 text-lg font-black">{classroom.invite_code}</p>
                <p className="mt-2 text-xs font-bold text-[var(--campus-muted)]">
                  {classroom.enrolled_student_count} student{classroom.enrolled_student_count === 1 ? "" : "s"}
                  {role === "student" ? ` / ${classroom.joined ? "Joined" : "Not joined"}` : ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
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

function PolicyCalculatorPage({
  form,
  result,
  status,
  isCalculating,
  onFormChange,
  onCalculate,
}: {
  form: StudentPolicyCalculationPayload;
  result: StudentPolicyCalculationResponse | null;
  status: string;
  isCalculating: boolean;
  onFormChange: (value: StudentPolicyCalculationPayload) => void;
  onCalculate: () => void;
}) {
  function updateTextField(
    field: "student_id" | "student_name" | "course_id",
    value: string,
  ) {
    onFormChange({ ...form, [field]: value });
  }

  function updateNumberField(field: NumericPolicyField, value: string) {
    const parsedValue = Number(value);
    onFormChange({ ...form, [field]: Number.isNaN(parsedValue) ? 0 : parsedValue });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
      <section className="panel">
        <h2 className="section-title">Policy Calculator</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
          Calculate a student's grade and semester fee using selected Strategy Pattern policies.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="policy-student-id">
              Student ID
            </label>
            <input
              id="policy-student-id"
              value={form.student_id}
              onChange={(event) => updateTextField("student_id", event.target.value)}
              className="field mt-2"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="policy-student-name">
              Student name
            </label>
            <input
              id="policy-student-name"
              value={form.student_name}
              onChange={(event) => updateTextField("student_name", event.target.value)}
              className="field mt-2"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="policy-course-id">
              Course ID
            </label>
            <input
              id="policy-course-id"
              value={form.course_id}
              onChange={(event) => updateTextField("course_id", event.target.value)}
              className="field mt-2"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="grade-policy">
              Grade policy
            </label>
            <select
              id="grade-policy"
              value={form.grade_policy}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  grade_policy: event.target.value as StudentPolicyCalculationPayload["grade_policy"],
                })
              }
              className="field mt-2"
            >
              <option value="lab_course">Lab course</option>
              <option value="theory_course">Theory course</option>
              <option value="balanced">Balanced</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="fee-policy">
              Fee policy
            </label>
            <select
              id="fee-policy"
              value={form.fee_policy}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  fee_policy: event.target.value as StudentPolicyCalculationPayload["fee_policy"],
                })
              }
              className="field mt-2"
            >
              <option value="regular">Regular</option>
              <option value="merit">Merit scholarship</option>
              <option value="sibling">Sibling discount</option>
              <option value="financial_aid">Financial aid</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {scoreFields.map((field) => (
            <div key={field.key}>
              <label className="field-label" htmlFor={`policy-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`policy-${field.key}`}
                type="number"
                min={0}
                max={field.key === "base_fee" ? undefined : 100}
                value={form[field.key]}
                onChange={(event) => updateNumberField(field.key, event.target.value)}
                className="field mt-2"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="primary-button mt-5"
          onClick={onCalculate}
          disabled={isCalculating}
        >
          {isCalculating ? "Calculating..." : "Calculate policies"}
        </button>

        <div className="mt-4 rounded-md bg-[var(--campus-blue-soft)] p-4 text-sm font-bold text-[var(--campus-blue)]">
          {status}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Calculation Result</h2>
        {result ? (
          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultMetric label="Final score" value={result.final_score.toFixed(2)} />
              <ResultMetric label="Letter grade" value={result.letter_grade} />
              <ResultMetric label="Original fee" value={`Tk ${result.original_fee.toFixed(2)}`} />
              <ResultMetric label="Payable fee" value={`Tk ${result.payable_fee.toFixed(2)}`} />
            </div>
            <div className="rounded-md border border-[var(--campus-border)] bg-[rgba(255,248,230,0.68)] p-4">
              <p className="text-sm font-black">{result.grade_policy_used}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
                {result.grade_explanation}
              </p>
            </div>
            <div className="rounded-md border border-[var(--campus-border)] bg-[rgba(255,248,230,0.68)] p-4">
              <p className="text-sm font-black">{result.fee_policy_used}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
                Discount Tk {result.discount_amount.toFixed(2)}. {result.fee_explanation}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-[var(--campus-muted)]">
            The calculated grade and fee summary will appear here.
          </p>
        )}
      </section>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md border border-[var(--campus-border)] bg-[rgba(255,248,230,0.68)] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--campus-muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </article>
  );
}

function StudentResultsPage({
  session,
  subjects,
}: {
  session: AuthSession | null;
  subjects: StudentSubjectRecord[];
}) {
  const totalCredits = subjects.reduce((total, subject) => total + subject.credit, 0);
  const averageScore =
    subjects.reduce((total, subject) => total + subject.finalScore, 0) / subjects.length;
  const failedSubjects = subjects.filter((subject) => subject.status === "Failed");

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultMetric label="Student ID" value={session?.university_id ?? "S-2026-001"} />
        <ResultMetric label="Total credits" value={totalCredits.toFixed(1)} />
        <ResultMetric label="Average score" value={averageScore.toFixed(1)} />
        <ResultMetric label="Failed subjects" value={String(failedSubjects.length)} />
      </section>

      <section className="panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title">Subjects and Marks</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
              Current semester course records for {session?.name ?? "the student"}.
            </p>
          </div>
          <span className="status-pill">Semester 3-2</span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left text-sm">
            <thead>
              <tr className="text-xs font-black uppercase tracking-[0.12em] text-[var(--campus-muted)]">
                <th className="px-3">Subject</th>
                <th className="px-3">Credit</th>
                <th className="px-3">Exam</th>
                <th className="px-3">Lab</th>
                <th className="px-3">Assignment</th>
                <th className="px-3">Attendance</th>
                <th className="px-3">Final</th>
                <th className="px-3">Grade</th>
                <th className="px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.code} className="bg-[rgba(255,248,230,0.68)]">
                  <td className="rounded-l-md border-y border-l border-[var(--campus-border)] px-3 py-3">
                    <p className="font-black">{subject.code}</p>
                    <p className="mt-1 text-xs font-semibold text-[var(--campus-muted)]">
                      {subject.title}
                    </p>
                  </td>
                  <td className="border-y border-[var(--campus-border)] px-3 py-3 font-bold">
                    {subject.credit}
                  </td>
                  <td className="border-y border-[var(--campus-border)] px-3 py-3 font-bold">
                    {subject.examScore || "-"}
                  </td>
                  <td className="border-y border-[var(--campus-border)] px-3 py-3 font-bold">
                    {subject.labScore || "-"}
                  </td>
                  <td className="border-y border-[var(--campus-border)] px-3 py-3 font-bold">
                    {subject.assignmentScore}
                  </td>
                  <td className="border-y border-[var(--campus-border)] px-3 py-3 font-bold">
                    {subject.attendanceScore}
                  </td>
                  <td className="border-y border-[var(--campus-border)] px-3 py-3 font-black">
                    {subject.finalScore.toFixed(1)}
                  </td>
                  <td className="border-y border-[var(--campus-border)] px-3 py-3">
                    <span className="status-pill">{subject.letterGrade}</span>
                  </td>
                  <td className="rounded-r-md border-y border-r border-[var(--campus-border)] px-3 py-3">
                    <span
                      className={
                        subject.status === "Passed"
                          ? "table-status table-status-active"
                          : "table-status"
                      }
                    >
                      {subject.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StudentFeesPage({
  subjects,
  fee,
}: {
  subjects: StudentSubjectRecord[];
  fee: StudentFeeRecord;
}) {
  const failedSubjects = subjects.filter((subject) => subject.status === "Failed");
  const netFee = fee.semesterFee - fee.scholarship + fee.failedCourseFee;

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultMetric label="Semester fee" value={`Tk ${fee.semesterFee.toFixed(2)}`} />
        <ResultMetric label="Scholarship" value={`Tk ${fee.scholarship.toFixed(2)}`} />
        <ResultMetric label="Failed course fee" value={`Tk ${fee.failedCourseFee.toFixed(2)}`} />
        <ResultMetric label="Due amount" value={`Tk ${fee.dueAmount.toFixed(2)}`} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="panel">
          <h2 className="section-title">Fee Summary</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ResultMetric label="Net fee" value={`Tk ${netFee.toFixed(2)}`} />
            <ResultMetric label="Paid amount" value={`Tk ${fee.paidAmount.toFixed(2)}`} />
            <ResultMetric label="Payment status" value={fee.status} />
            <ResultMetric label="Due date" value={fee.dueDate} />
          </div>
          <div className="mt-4 rounded-md bg-[var(--campus-blue-soft)] p-4 text-sm font-bold text-[var(--campus-blue)]">
            Failed courses add an extra retake fee to the student's payable amount.
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">Extra Fee Details</h2>
          <div className="mt-5 space-y-3">
            {failedSubjects.length > 0 ? (
              failedSubjects.map((subject) => (
                <article
                  key={subject.code}
                  className="rounded-md border border-[var(--campus-border)] bg-[rgba(255,248,230,0.68)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{subject.code}</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--campus-muted)]">
                        {subject.title}
                      </p>
                    </div>
                    <span className="status-pill">Grade {subject.letterGrade}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-[var(--campus-muted)]">
                    Extra fee: Tk {subject.extraFee.toFixed(2)}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--campus-muted)]">
                No failed subjects, so no extra retake fee is applied.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
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
