const features = [
  {
    title: "Post the brief",
    body: "A brand writes the campaign once: niche, deliverable, and what done looks like. Creators see the briefs that are actually open.",
  },
  {
    title: "Review who applied",
    body: "Applications stay on the campaign. A portfolio, a niche, and a name. Shortlist from the list, not from a thread of emails.",
  },
  {
    title: "Take the submission",
    body: "The work comes back on the same brief. Status moves from pending to approved, or it goes back for another pass.",
  },
  {
    title: "One record, three rooms",
    body: "Admin, brand, and creator each have a workspace. The campaign is the thing they share.",
  },
];

export function FeatureList() {
  return (
    <section className="mx-auto w-full max-w-7xl border-x border-black/[0.08]">
      <div className="px-6 pb-8 pt-24 sm:px-8 sm:pt-32">
        <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl sm:leading-[1.08]">
          The brief stays attached to the work.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-neutral-600">
          Post it, staff it, and review what comes back.
        </p>
      </div>
      <div className="divide-y divide-black/10 border-t border-black/10">
        {features.map((feature, index) => (
          <details
            key={feature.title}
            open={index === 0}
            className="group px-6 sm:px-8"
          >
            <summary className="cursor-pointer list-none py-6 text-xl font-medium tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-6">
                {feature.title}
                <span className="text-neutral-400 transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="max-w-2xl pb-6 text-neutral-600">{feature.body}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
