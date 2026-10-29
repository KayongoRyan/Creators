import Link from "next/link";
import { earnByNichePromo, earnByNicheSteps } from "@/content/earnByNiche";
import { routes } from "@/config/routes";

export function EarnByNicheSection() {
  return (
    <>
      <section className="border-t border-mkt-border bg-mkt-bg px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-mkt-border bg-mkt-muted p-8 sm:p-10 lg:p-12">
            <span className="inline-flex rounded-full border border-mkt-border bg-mkt-card px-4 py-1.5 text-sm font-medium text-mkt-fg">
              {earnByNichePromo.badge}
            </span>
            <h2 className="mt-8 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-mkt-fg sm:text-5xl lg:text-[3.25rem]">
              {earnByNichePromo.title}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-mkt-fg-muted sm:text-xl">
              {earnByNichePromo.lead}
            </p>
            <Link
              href="#how-earnings-work"
              className="mt-10 flex w-full items-center justify-center rounded-2xl bg-mkt-accent py-4 text-lg font-semibold text-mkt-on-accent shadow-mkt-cta transition hover:bg-mkt-accent-hi active:translate-y-0.5 active:shadow-mkt-cta-active"
            >
              {earnByNichePromo.cta}
            </Link>
          </div>
        </div>
      </section>

      <section
        id="how-earnings-work"
        className="scroll-mt-24 border-t border-mkt-border bg-mkt-bg px-6 py-16 sm:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-mkt-accent">How you earn by niche</p>
          <h3 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-mkt-fg sm:text-3xl">
            From profile to payout in four steps
          </h3>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {earnByNicheSteps.map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-mkt-border bg-mkt-card p-6"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-mkt-accent text-sm font-bold text-mkt-on-accent">
                  {item.step}
                </span>
                <h4 className="mt-4 text-lg font-semibold text-mkt-fg">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-mkt-fg-muted">{item.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={routes.public.apply}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-mkt-accent px-6 text-sm font-semibold text-mkt-on-accent shadow-mkt-cta transition hover:bg-mkt-accent-hi"
            >
              Apply with your niche
            </Link>
            <Link
              href={routes.creator.campaigns}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-mkt-border px-6 text-sm font-semibold text-mkt-fg transition hover:bg-mkt-muted"
            >
              Browse open campaigns
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
