"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrandCampaignLogo } from "@/components/marketing/creators/BrandCampaignLogo";
import { featuredBrandCampaigns } from "@/content/featuredBrandCampaigns";
import { cn } from "@/lib/utils/cn";

const CARD_HEIGHT = "min-h-[16.5rem] h-auto sm:h-[18rem]";

function BrandCampaignCard({
  campaign,
}: {
  campaign: (typeof featuredBrandCampaigns)[number];
}) {
  return (
    <article
      className={cn(
        "flex h-full w-[min(calc(100vw-2.5rem),28rem)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-mkt-border sm:w-[32rem] sm:flex-row lg:w-[34rem]",
      )}
    >
      <div className="flex w-full shrink-0 items-center justify-center border-b border-mkt-border px-6 py-6 sm:w-[40%] sm:border-b-0 sm:px-8 sm:py-8">
        <BrandCampaignLogo id={campaign.id} className="max-w-[7.5rem] sm:max-w-[9.5rem]" />
      </div>

      <div
        className="hidden w-px shrink-0 bg-mkt-border sm:my-10 sm:block"
        aria-hidden="true"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 py-6 pl-5 pr-6 sm:gap-6 sm:py-9 sm:pl-7 sm:pr-8">
        <div>
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-mkt-fg-subtle">
            {campaign.brand}
          </p>
          <h3 className="mt-2.5 line-clamp-2 text-base font-semibold leading-snug text-mkt-fg sm:text-[1.0625rem] sm:leading-6">
            {campaign.title}
          </h3>
        </div>

        <p className="line-clamp-3 text-xs leading-5 text-mkt-fg-muted sm:text-sm sm:leading-6">
          {campaign.description}
        </p>

        <ul className="mt-auto space-y-3 border-t border-mkt-border pt-4 text-xs text-mkt-fg sm:space-y-3.5 sm:pt-5 sm:text-sm">
          <li className="flex items-baseline gap-3">
            <span className="w-12 shrink-0 text-mkt-fg-subtle">Budget</span>
            <span className="font-semibold">{campaign.budget}</span>
          </li>
          <li className="flex items-baseline gap-3">
            <span className="w-12 shrink-0 text-mkt-fg-subtle">Niche</span>
            <span className="font-medium">{campaign.niche}</span>
          </li>
        </ul>
      </div>
    </article>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandCampaignCardsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll <= 4 || el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  const scrollByPage = useCallback(
    (direction: -1 | 1) => {
      const el = scrollRef.current;
      if (!el) return;
      const firstCard = el.querySelector("li");
      const gap = 32;
      const step = firstCard ? firstCard.clientWidth + gap : el.clientWidth * 0.85;
      el.scrollBy({ left: direction * step, behavior: "smooth" });
      window.setTimeout(updateScrollState, 350);
    },
    [updateScrollState],
  );

  return (
    <div className="mt-12">
      <div className="mb-4 flex justify-end gap-2 sm:mb-5">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollLeft}
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full border border-mkt-border text-mkt-fg transition",
            "hover:bg-mkt-card disabled:pointer-events-none disabled:opacity-35",
          )}
          aria-label="Previous campaigns"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollRight}
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full border border-mkt-border text-mkt-fg transition",
            "hover:bg-mkt-card disabled:pointer-events-none disabled:opacity-35",
          )}
          aria-label="Next campaigns"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="-mx-[max(1.25rem,env(safe-area-inset-left,0px))] overflow-x-auto px-[max(1.25rem,env(safe-area-inset-left,0px))] [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max items-stretch gap-6 snap-x snap-mandatory sm:gap-8">
          {featuredBrandCampaigns.map((campaign) => (
            <li key={campaign.id} className={cn("flex shrink-0", CARD_HEIGHT)}>
              <BrandCampaignCard campaign={campaign} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
