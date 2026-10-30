import { whopLanding } from "@/content/whopLanding";
import { mktContainer, mktSafeXWide, mktSectionTitle, mktSectionY } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

const NEUTRAL_BG = "#f4f4f5";

export function CompetitiveMarketsSection() {
  return (
    <section
      id="competitive-markets"
      className={cn("border-t border-mkt-border bg-mkt-bg", mktSafeXWide, mktSectionY)}
    >
      <div className={mktContainer}>
        <h2 className={cn("max-w-3xl text-mkt-fg", mktSectionTitle)}>
          {whopLanding.markets.title}
        </h2>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {whopLanding.markets.items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-mkt-border p-6 sm:p-7"
              style={{ backgroundColor: NEUTRAL_BG }}
            >
              <h3 className="text-lg font-semibold text-mkt-fg">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-mkt-fg-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
