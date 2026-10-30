import { HeroCharacterRow } from "@/components/marketing/creators/HeroCharacterRow";
import { mktPageTitle } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

function HeroSquiggle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 280"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M95 20c-30 40-50 90-40 140s40 80 20 120M70 50c20 30 10 70-10 100M40 80c15 25 5 55-5 85"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CampaignHeroSlideshow() {
  return (
    <section
      className={cn(
        "relative isolate -mt-[7.25rem] overflow-hidden bg-mkt-bg pt-[7.25rem] text-mkt-fg lg:-mt-[4.5rem] lg:pt-[4.5rem]",
        "rounded-b-[3rem] sm:rounded-b-[4.5rem] lg:rounded-b-[5.5rem]",
      )}
    >
      <HeroSquiggle className="pointer-events-none absolute left-2 top-32 hidden h-64 w-16 text-mkt-fg opacity-90 sm:block lg:left-8" />
      <HeroSquiggle className="pointer-events-none absolute right-2 top-28 hidden h-64 w-16 scale-x-[-1] text-mkt-fg opacity-90 sm:block lg:right-8" />

      <div className="relative z-10 mx-auto max-w-4xl px-[max(1.25rem,env(safe-area-inset-left,0px))] pb-2 pt-14 text-center sm:px-8 sm:pt-20 lg:pt-24">
        <div
          className="mx-auto mb-6 flex w-fit items-end justify-center gap-1.5 text-mkt-fg"
          aria-hidden="true"
        >
          <span className="h-8 w-0.5 rounded-full bg-mkt-fg" />
          <span className="h-11 w-0.5 rounded-full bg-mkt-fg" />
          <span className="h-6 w-0.5 rounded-full bg-mkt-fg" />
        </div>

        <h1 className={mktPageTitle}>
          Make your{" "}
          <span className="relative inline-block px-1">
            <span
              className="pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-[50%] border-2 border-mkt-fg sm:-inset-x-3"
              aria-hidden="true"
            />
            creativity
          </span>{" "}
          your next opportunity
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-mkt-fg-muted sm:text-base">
          Find brand campaigns, pitch what you do best, and get paid for the work
          you create.
        </p>
      </div>

      <HeroCharacterRow />
    </section>
  );
}
