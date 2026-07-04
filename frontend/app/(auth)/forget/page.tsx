import Link from "next/link";

export default function ForgetPasswordPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="text-sm font-black text-[var(--campus-teal)]">
          CSEDU University Management
        </Link>
        <h1 className="mt-5 text-3xl font-black tracking-normal">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--campus-muted)]">
          Enter your university email to request a password reset.
        </p>
        <form className="mt-6 space-y-4">
          <div>
            <label className="field-label" htmlFor="email">
              University email
            </label>
            <input id="email" className="field mt-2" placeholder="name@university.edu" />
          </div>
          <button type="button" className="primary-button">
            Send reset link
          </button>
        </form>
        <Link href="/signin" className="mt-5 inline-flex text-sm font-bold text-[var(--campus-teal)]">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
