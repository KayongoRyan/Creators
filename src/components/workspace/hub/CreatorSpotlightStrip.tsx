"use client";

import { hubCreatorProfiles } from "@/content/workspaceHub";
import { cn } from "@/lib/utils/cn";

export function CreatorSpotlightStrip({ className }: { className?: string }) {
  return (
    <section className={cn("px-5 sm:px-8", className)}>
      <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-[linear-gradient(180deg,#fafafa_0%,#f0f0f0_100%)] px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              On the platform
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
              Creators shipping campaigns this week
            </h2>
          </div>
          <p className="text-sm text-neutral-600 sm:max-w-xs sm:text-right">
            Real profiles from the demo roster — niches, reach, and platforms in one glance.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {hubCreatorProfiles.map((item, index) => (
            <article
              key={item.handle}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:border-black/20 hover:shadow-md",
                index === 0 && "lg:col-span-1 ring-1 ring-black/5",
              )}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-neutral-900 font-mono text-xs font-bold text-white">
                {item.name
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">{item.name}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-500">
                  {item.followers} · {item.platform}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
