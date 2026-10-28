import { marketingFrame, marketingType } from "@/lib/marketing";

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
    <section className={`mx-auto w-full max-w-7xl ${marketingFrame}`}>
      <div className="px-6 pb-8 pt-24 sm:px-8 sm:pt-32">
        <h2 className={marketingType.sectionTitle}>
          The brief stays attached to the work.
        </h2>
        <p className={marketingType.sectionLead}>
          Post it, staff it, and review what comes back.
        </p>
      </div>
      <div className="divide-y divide-black/11 border-t border-black/11">
        {features.map((feature, index) => (
          <details
            key={feature.title}
            open={index === 0}
            className="group px-6 sm:px-8"
          >
            <summary className="cursor-pointer list-none py-6 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-6">
                <span className={marketingType.accordionTitle}>
                  {feature.title}
                </span>
                <span className="text-base text-gray-400 transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className={`max-w-2xl pb-6 ${marketingType.body}`}>
              {feature.body}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
