import Link from "next/link";
import { routes } from "@/config/routes";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCampaigns } from "@/features/campaigns";
import { formatCurrency } from "@/lib/formatters";

export default async function CreatorHomePage() {
  const campaigns = await getCampaigns();
  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "active",
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <PageHeader
          title="Your next partnership starts here."
          description="Explore open briefs, share what you create, and find brands that fit your work."
        />
        <Link
          href={routes.creator.campaigns}
          className="mb-8 inline-flex min-h-11 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Browse campaigns
        </Link>
      </div>

      <section aria-label="Creator opportunities" className="mb-10 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-medium text-gray-600">Open campaigns</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
            {activeCampaigns.length}
          </p>
          <p className="mt-2 text-sm leading-5 text-gray-600">
            Active opportunities in the current campaign feed.
          </p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5">
          <p className="text-sm font-medium text-gray-600">Creator profile</p>
          <p className="mt-3 text-xl font-semibold tracking-tight text-gray-900">
            Add your details
          </p>
          <p className="mt-2 text-sm leading-5 text-gray-600">
            Share your niches and portfolio to help brands understand your work.
          </p>
          <Link
            href={routes.public.apply}
            className="mt-4 inline-flex text-sm font-semibold text-emerald-800 underline decoration-emerald-500 underline-offset-4 hover:text-emerald-950"
          >
            Complete your profile
          </Link>
        </div>
      </section>

      <section aria-labelledby="open-campaigns-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Campaign feed
            </p>
            <h2
              id="open-campaigns-heading"
              className="mt-2 text-xl font-semibold tracking-tight text-gray-900"
            >
              Open campaigns
            </h2>
          </div>
          <Link
            href={routes.creator.campaigns}
            className="text-sm font-medium text-gray-700 underline decoration-black/20 underline-offset-4 hover:text-gray-950"
          >
            View all campaigns
          </Link>
        </div>

        {activeCampaigns.length === 0 ? (
          <p className="border-y border-black/10 py-6 text-sm text-gray-600">
            There are no open campaigns right now. Check back soon.
          </p>
        ) : (
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {activeCampaigns.slice(0, 3).map((campaign) => (
              <li
                key={campaign.id}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {campaign.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Budget {formatCurrency(campaign.budgetCents)}
                  </p>
                </div>
                <Link
                  href={routes.creator.campaigns}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-gray-900 transition-colors hover:border-black/30 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  View campaign
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
