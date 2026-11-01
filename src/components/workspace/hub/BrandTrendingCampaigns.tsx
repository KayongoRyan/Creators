"use client";

import Link from "next/link";
import { BrandCampaignLogo } from "@/components/marketing/creators/BrandCampaignLogo";
import { featuredBrandCampaigns } from "@/content/featuredBrandCampaigns";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

const trending = featuredBrandCampaigns.slice(0, 4);

export function BrandTrendingCampaigns({
  guest,
}: {
  guest: boolean;
}) {
  const joinHref = `${routes.auth.join}?role=brand&mode=signup`;
  const ctaHref = guest ? joinHref : routes.brand.campaigns;

  return (
    <section className="px-5 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Trending
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Campaigns creators are applying to
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Live-style briefs from the demo — budget, format, and niche at a glance.
          </p>
        </div>
        <Link
          href={ctaHref}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          {guest ? "Join to launch" : "View campaigns"}
          <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {trending.map((campaign) => (
          <li key={campaign.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-black/10 bg-white sm:flex-row">
              <div className="flex items-center justify-center border-b border-black/8 bg-neutral-50 px-6 py-8 sm:w-[38%] sm:border-b-0 sm:border-r">
                <BrandCampaignLogo id={campaign.id} className="max-w-[6.5rem] sm:max-w-[7.5rem]" />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {campaign.brand}
                </p>
                <h3 className="mt-2 text-base font-semibold leading-snug text-neutral-900">
                  {campaign.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-neutral-600">
                  {campaign.description}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-black/8 pt-4 text-xs">
                  <div>
                    <dt className="font-mono uppercase tracking-wide text-neutral-500">Budget</dt>
                    <dd className="mt-0.5 font-semibold text-neutral-900">{campaign.budget}</dd>
                  </div>
                  <div>
                    <dt className="font-mono uppercase tracking-wide text-neutral-500">Niche</dt>
                    <dd className="mt-0.5 font-medium text-neutral-800">{campaign.niche}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-sm text-neutral-500 sm:text-left">
        Need your own brief live?{" "}
        <Link href={joinHref} className={cn("font-semibold text-neutral-900 underline underline-offset-4")}>
          Start as a business
        </Link>
      </p>
    </section>
  );
}
