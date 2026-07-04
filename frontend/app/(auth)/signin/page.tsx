import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="text-sm font-black text-[var(--campus-teal)]">
          CSEDU University Management
        </Link>
        <h1 className="mt-5 text-3xl font-black tracking-normal">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
          Choose a demo role to enter the portal.
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" className="field mt-2" defaultValue="rahim@student.example.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input id="password" type="password" className="field mt-2" defaultValue="student123" />
          </div>
        </form>

        <div className="mt-5 grid gap-3">
          <Link href="/student/dashboard" className="primary-link text-center">
            Continue as Student
          </Link>
          <Link href="/teacher/dashboard" className="secondary-button justify-center">
            Continue as Teacher
          </Link>
          <Link href="/staff/dashboard" className="secondary-button justify-center">
            Continue as Staff
          </Link>
        </div>

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
