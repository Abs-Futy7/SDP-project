function Footer() {
  return (
    <footer
      id="contact"
      className="flex flex-col gap-4 rounded-lg bg-[var(--kidos-lavender)] px-5 py-5 text-sm font-semibold text-[var(--kidos-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-7"
    >
      <div>
        <p className="text-lg font-black text-[var(--kidos-purple)]">
          Kidos Learning Academy
        </p>
        <p className="mt-1">Joyful learning for confident young minds.</p>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <a href="mailto:hello@kidosacademy.com" className="hover:text-[var(--kidos-purple)]">
          hello@kidosacademy.com
        </a>
        <a href="tel:+8801712345678" className="hover:text-[var(--kidos-purple)]">
          +880 1712-345-678
        </a>
      </div>
    </footer>
  );
}

export default Footer;
