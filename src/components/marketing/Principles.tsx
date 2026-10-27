const points = [
  {
    title: "The brief does not leave the campaign",
    body: "Niche, deliverable, and deadline live on the campaign the creator applied to.",
  },
  {
    title: "Applications are a queue",
    body: "Who applied, what they make, and whether they are shortlisted. That is the whole record.",
  },
  {
    title: "A submission has a status",
    body: "Pending, approved, or sent back. Both sides see the same state.",
  },
];

export function Principles() {
  return (
    <section className="bg-[#262626] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl sm:leading-[1.08]">
          Nothing extra between the brief and the cut.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-white/65">
          The workspace is the campaign, the people who applied, and the work they sent.
        </p>
        <ul className="mt-14 grid gap-10 md:grid-cols-3">
          {points.map((point) => (
            <li key={point.title}>
              <h3 className="text-lg font-medium">{point.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
