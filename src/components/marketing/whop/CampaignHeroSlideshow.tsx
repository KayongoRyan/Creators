"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { heroCampaignSlides } from "@/content/heroCampaigns";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

const INTERVAL_MS = 5500;

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-mkt-accent px-6 text-sm font-semibold text-mkt-on-accent transition hover:bg-mkt-accent-hi";

export function CampaignHeroSlideshow() {
  const [index, setIndex] = useState(0);
  const slide = heroCampaignSlides[index];

  const go = useCallback((next: number) => {
    setIndex((next + heroCampaignSlides.length) % heroCampaignSlides.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % heroCampaignSlides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="border-b border-mkt-border bg-mkt-bg">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:py-16">
        <div className="flex flex-col justify-center">
          <p className="text-sm text-mkt-fg-subtle">Live campaigns on Creators</p>
          <div className="relative mt-4 min-h-[8rem]">
            {heroCampaignSlides.map((item, i) => (
              <div
                key={item.id}
                className={cn(
                  "transition-all duration-500",
                  i === index
                    ? "relative translate-y-0 opacity-100"
                    : "pointer-events-none absolute inset-0 translate-y-2 opacity-0",
                )}
                aria-hidden={i !== index}
              >
                <p className="text-sm font-medium text-mkt-accent">{item.brand}</p>
                <h1 className="mt-2 max-w-lg text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem]/tight">
                  {item.title}
                </h1>
                <p className="mt-4 max-w-md text-base text-mkt-fg-muted">
                  {item.type} · {item.payout} · Deadline {item.deadline}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={routes.auth.register} className={btnPrimary}>
              Get started
            </Link>
            <Link
              href={routes.creator.campaigns}
              className="text-sm font-medium text-mkt-fg-muted underline-offset-4 hover:text-mkt-accent hover:underline"
            >
              Browse campaigns
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2">
            {heroCampaignSlides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.brand} campaign`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-8 bg-mkt-accent" : "w-2 bg-mkt-border hover:bg-mkt-fg-subtle",
                )}
              />
            ))}
          </div>
        </div>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-mkt-border bg-mkt-muted shadow-[0_24px_80px_rgba(0,8,20,0.45)]">
          {heroCampaignSlides.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000814]/80 via-transparent to-transparent lg:bg-gradient-to-l lg:from-[#000814]/60 lg:via-transparent" />
            </div>
          ))}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5">
            <button
              type="button"
              aria-label="Previous campaign"
              onClick={() => go(index - 1)}
              className="rounded-full border border-mkt-border bg-mkt-bg/70 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-mkt-muted"
            >
              Prev
            </button>
            <button
              type="button"
              aria-label="Next campaign"
              onClick={() => go(index + 1)}
              className="rounded-full border border-mkt-border bg-mkt-bg/70 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-mkt-muted"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
