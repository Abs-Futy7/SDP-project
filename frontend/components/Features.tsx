function Features() {
  return (
    <section id="about" className="px-1 py-14 sm:px-0 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-end">
        <div>
          <h2 className="max-w-xl text-4xl font-black leading-[1.04] tracking-normal text-[var(--kidos-ink)] sm:text-5xl">
            Kidos Learning Academy is a modern place for curious kids
          </h2>
          <p className="mt-5 max-w-sm text-base font-semibold leading-relaxed text-[var(--kidos-muted)]">
            Every child learns differently, so our lessons blend patient
            guidance, playful practice, and steady feedback for parents.
          </p>
        </div>

        <div id="programmes" className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-lg bg-[var(--kidos-orange)] p-6 text-white shadow-lg shadow-orange-200/70">
            <h3 className="text-2xl font-black">Visible progress</h3>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-white/90">
              Weekly updates help families see what improved, what needs
              practice, and where each child is gaining confidence.
            </p>
          </article>

          <article className="rounded-lg bg-[var(--kidos-orange)] p-6 text-white shadow-lg shadow-orange-200/70">
            <h3 className="text-2xl font-black">Young minds first</h3>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-white/90">
              Lessons use stories, speaking practice, games, and small goals to
              keep learning active without pressure.
            </p>
          </article>

          <article className="relative overflow-hidden rounded-lg bg-[var(--kidos-purple)] p-6 text-white shadow-lg shadow-purple-200/70 sm:col-span-2">
            <div className="pointer-events-none absolute -bottom-20 right-0 size-48 rounded-full bg-[var(--kidos-lavender)]/55" />
            <div className="relative max-w-xl">
              <h3 className="text-2xl font-black">Individual approach</h3>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-white/90">
                Small groups and focused support let teachers adapt pace,
                practice, and encouragement to each learner.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Features;
