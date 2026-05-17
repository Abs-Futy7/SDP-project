const faqs = [
  {
    question: "Who can join Kidos?",
    answer:
      "Our beginner-friendly programmes are designed for young learners who need a warm, structured place to build confidence.",
  },
  {
    question: "How are lessons arranged?",
    answer:
      "Children learn in small groups with speaking practice, guided activities, and regular progress notes for families.",
  },
  {
    question: "Can parents track progress?",
    answer:
      "Yes. Parents receive simple updates that show strengths, practice areas, and next learning goals.",
  },
];

function Faq() {
  return (
    <section id="faq" className="border-t border-[var(--kidos-lavender)] py-14">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--kidos-orange-deep)]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-4xl">
            Questions families ask first
          </h2>
        </div>

        <div className="grid gap-3">
          {faqs.map((item) => (
            <article
              key={item.question}
              className="rounded-lg border border-[var(--kidos-lavender-strong)] bg-[var(--kidos-cream)] p-5"
            >
              <h3 className="text-lg font-black text-[var(--kidos-purple)]">
                {item.question}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--kidos-muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faq;
