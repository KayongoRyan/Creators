import { PageHeader } from "@/components/shared/PageHeader";

const campaigns = [
  {
    title: "Primus Beer — reaction videos",
    status: "Active",
    lines: [
      "Type: UGC reaction · Budget: RWF 600,000 · Fee (20%): RWF 120,000",
      "Creators assigned: 8 · Submissions: 5 received, 3 approved",
      "Deadline: June 3, 2026",
    ],
    people: [
      ["Marie K.", "@mariekigali · 28K followers", "Approved"],
      ["Jean-Baptiste N.", "@jbntwali · 12K followers", "Pending review"],
      ["Amina G.", "@aminacreates · 9K followers", "Not yet submitted"],
    ],
  },
  {
    title: "Iwacu Music — song clip campaign",
    status: "Active",
    lines: [
      "Type: Clipping (CPM) · Budget: RWF 400,000 · Fee (20%): RWF 80,000",
      "Creators assigned: 5 · Submissions: 2 received, 2 approved",
    ],
  },
  {
    title: "KCB Rwanda — product review",
    status: "Draft",
    lines: [
      "Budget: RWF 800,000 · Awaiting brand payment confirmation before going live.",
    ],
  },
] as const;

export default function AdminCampaignsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Campaigns" description="All active and past campaigns" />
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {campaigns.map((campaign) => (
          <li key={campaign.title} className="py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                {campaign.title}
              </h2>
              <p className="text-sm font-medium text-gray-500">{campaign.status}</p>
            </div>
            <div className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
              {campaign.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            {"people" in campaign ? (
              <ul className="mt-4 divide-y divide-black/10 border-t border-black/10">
                {campaign.people.map(([name, handle, status]) => (
                  <li
                    key={name}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{name}</p>
                      <p className="text-sm text-gray-600">{handle}</p>
                    </div>
                    <p className="text-sm text-gray-500">{status}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
