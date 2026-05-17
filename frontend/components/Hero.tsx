import Image from "next/image";

function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden rounded-lg bg-[var(--kidos-ink)]"
    >
      <Image
        src="/kidos-hero.png"
        alt="A smiling child learning at a desk"
        width={1792}
        height={1024}
        priority
        className="h-[440px] w-full object-cover object-center sm:h-[500px] lg:h-[520px]"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
      <div className="pointer-events-none absolute -left-28 top-14 h-64 w-[560px] rotate-[-20deg] rounded-full border-[42px] border-[var(--kidos-purple)] opacity-95 sm:-left-20 sm:top-10 sm:h-80 sm:w-[700px] sm:border-[54px]" />
      <div className="pointer-events-none absolute -right-28 bottom-6 h-48 w-[420px] rotate-[-12deg] rounded-full border-[34px] border-[var(--kidos-lavender)] opacity-90 sm:-right-10 sm:h-64 sm:w-[560px] sm:border-[48px]" />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-7 px-5 pb-7 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-9 lg:px-9">
        <div className="max-w-xl">
          <p className="mb-3 w-fit rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold text-white backdrop-blur">
            Kidos Learning Academy
          </p>
          <h1 className="text-balance text-3xl font-black leading-[1.02] tracking-normal text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            Learning with joy, confidence, and real progress.
          </h1>
          <a
            href="#programmes"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--kidos-orange)] px-8 text-sm font-black text-white shadow-lg shadow-black/20 transition hover:bg-[var(--kidos-orange-deep)]"
          >
            Get started
          </a>
        </div>

        <div
          id="reviews"
          className="max-w-[240px] rounded-lg bg-white/15 p-4 text-white shadow-lg backdrop-blur-md"
        >
          <p className="text-right text-sm font-black leading-tight">
            100+ happy students learning with us
          </p>
          <div className="mt-3 flex justify-end -space-x-2">
            {["A", "M", "R", "S"].map((initial, index) => (
              <span
                key={initial}
                className="grid size-10 place-items-center rounded-full border-2 border-white text-xs font-black text-white"
                style={{
                  backgroundColor: [
                    "#f7941d",
                    "#5c2bd1",
                    "#d95f89",
                    "#24a0b8",
                  ][index],
                }}
              >
                {initial}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
