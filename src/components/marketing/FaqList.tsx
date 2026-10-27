import { marketingFrame, marketingType } from "@/lib/marketing";

const faqs = [
  {
    q: "What is Creators?",
    a: "A workspace where brands post campaigns, creators apply, and submissions are reviewed on the same brief.",
  },
  {
    q: "How do I apply?",
    a: "Name, the niche you actually make, and a portfolio link. A person reviews the application.",
  },
  {
    q: "How does a campaign work?",
    a: "A brand opens a brief. Creators apply. The ones who are chosen send the work back as a submission.",
  },
  {
    q: "Who reviews submissions?",
    a: "The brand reviews work on the campaign. Status is pending, approved, or sent back.",
  },
  {
    q: "Do brands and creators see the same thing?",
    a: "They have separate workspaces. The campaign, the application, and the submission are the shared record.",
  },
];

export function FaqList() {
  return (
    <section className={`mx-auto w-full max-w-7xl ${marketingFrame}`}>
      <div className="px-6 pb-10 pt-24 sm:px-8 sm:pt-32">
        <h2 className={marketingType.sectionTitle}>Frequently asked questions</h2>
        <p className={marketingType.sectionLead}>
          How a brief becomes an application, then a submission.
        </p>
      </div>
      <div className="divide-y divide-black/11 border-t border-black/11">
        {faqs.map((item) => (
          <details key={item.q} className="group px-6 sm:px-8">
            <summary className="cursor-pointer list-none py-5 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-6">
                <span className={marketingType.faqQuestion}>{item.q}</span>
                <span className="text-base text-gray-400 transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className={`max-w-2xl pb-5 ${marketingType.body}`}>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
