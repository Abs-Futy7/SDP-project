import Link from "next/link";

const features = [
  {
    title: "Role-based accounts",
    description: "Students, teachers, and staff enter the portal through their own dashboard flow.",
  },
  {
    title: "Classroom notice board",
    description: "Class notices reach enrolled students as soon as teachers publish them.",
  },
  {
    title: "Academic operations",
    description: "Manage classrooms, registration, students, and notices from one university portal.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--campus-bg)] text-[var(--campus-ink)]">
      <header className="border-b border-[var(--campus-border)] bg-white">
        <nav className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="text-xl font-black tracking-normal text-[var(--campus-teal)]">
            CSEDU University Management
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
            <a href="#features" className="top-link">
              Features
            </a>
            <a href="#portal" className="top-link">
              Portal
            </a>
            <Link href="/signin" className="secondary-button">
              Sign in
            </Link>
            <Link href="/signup" className="primary-link">
              Create account
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-[var(--campus-paper-strong)] sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--campus-amber)]">
            Academic portal
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
            A simple university management system for classes, users, and notices.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-[color-mix(in_srgb,var(--campus-paper)_78%,white)]">
            Register university users by role, manage classroom notice boards, and keep enrolled
            students updated from a clean web portal.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup" className="primary-link">
              Register now
            </Link>
            <Link href="/signin" className="secondary-button">
              Go to sign in
            </Link>
          </div>
        </div>

        <div id="portal" className="panel">
          <div className="flex items-center justify-between border-b border-[var(--campus-border)] pb-4">
            <div>
              <p className="text-sm font-black">Today&apos;s classroom activity</p>
              <p className="mt-1 text-xs font-semibold text-[var(--campus-muted)]">
                CSE-3204 / SDP Lab
              </p>
            </div>
            <span className="status-pill">Live</span>
          </div>

          <div className="mt-5 grid gap-3">
            {[
              ["New notice", "Observer pattern assignment will be checked this week."],
              ["Registration", "Student, teacher, and staff account routes are active."],
              ["Database", "MongoDB Atlas connection is shared by backend services."],
            ].map(([title, detail]) => (
              <article key={title} className="rounded-md border border-[var(--campus-border)] bg-[#fbfcfe] p-4">
                <p className="text-sm font-black">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="panel">
              <h2 className="section-title">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--campus-muted)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
