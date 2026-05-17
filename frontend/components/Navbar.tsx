function Navbar() {
  return (
    <header className="mb-4 rounded-lg bg-[var(--kidos-lavender)] px-4 py-3 sm:px-7">
      <nav className="flex flex-col gap-4 text-sm font-semibold text-[var(--kidos-ink)] sm:flex-row sm:items-center sm:justify-between">
        <a
          href="#top"
          className="max-w-48 text-lg font-black leading-tight tracking-normal text-[var(--kidos-purple)] sm:max-w-none sm:text-xl"
        >
          Kidos Learning Academy
        </a>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:justify-center">
          <a href="#about" className="transition hover:text-[var(--kidos-purple)]">
            About us
          </a>
          <a href="#programmes" className="transition hover:text-[var(--kidos-purple)]">
            Programmes
          </a>
          <a href="#reviews" className="transition hover:text-[var(--kidos-purple)]">
            Reviews
          </a>
          <a href="#faq" className="transition hover:text-[var(--kidos-purple)]">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <p className="text-xs font-black">+880 1712-345-678</p>
            <p className="text-[10px] font-semibold text-[var(--kidos-muted)]">
              Sat-Thu 9am-6pm
            </p>
          </div>
          <a
            href="#contact"
            aria-label="Contact Kidos Learning Academy"
            className="grid size-9 place-items-center rounded-full bg-[var(--kidos-purple)] text-sm font-black text-white shadow-sm transition hover:bg-[var(--kidos-purple-deep)]"
          >
            K
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
