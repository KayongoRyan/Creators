import Link from "next/link";
import { creatorsLanding } from "@/content/creatorsLanding";
import { routes } from "@/config/routes";
import { mktContainer, mktSafeXWide, mktSectionY } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

type Testimonial = (typeof creatorsLanding.testimonials)[number];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function QuoteMark({ featured }: { featured?: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "size-9 shrink-0",
        featured ? "text-mkt-fg" : "text-mkt-fg-subtle/40",
      )}
      viewBox="0 0 36 28"
      fill="currentColor"
    >
      <path d="M8.5 0C3.5 0 0 3.8 0 9.2c0 6.2 4.2 11.5 10.5 14.5L8 28c-7.5-3.5-12-10.2-12-18.8C-4 4.5 1.2 0 8.5 0zm19 0c-5 0-8.5 3.8-8.5 9.2 0 6.2 4.2 11.5 10.5 14.5L27 28c-7.5-3.5-12-10.2-12-18.8C15 4.5 20.2 0 27.5 0z" />
    </svg>
  );
}

function TestimonialCard({
  item,
  featured,
  align,
}: {
  item: Testimonial;
  featured?: boolean;
  align: "start" | "end";
}) {
  return (
    <blockquote
      className={cn(
        "relative max-w-md rounded-2xl bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.07)] ring-1 ring-black/[0.06] sm:p-6",
        featured && "border-l-4 border-black pl-4 sm:pl-5",
        align === "end" ? "ml-auto lg:mr-4" : "lg:ml-0 lg:mr-8",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-800 ring-1 ring-black/10"
            aria-hidden
          >
            {initials(item.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-mkt-fg">{item.name}</p>
            <p className="truncate text-xs text-mkt-fg-muted">{item.role}</p>
          </div>
        </div>
        <QuoteMark featured={featured} />
      </div>
      <p className="mt-4 text-sm leading-6 text-mkt-fg-muted sm:text-[0.9375rem] sm:leading-7">
        {item.quote}
      </p>
    </blockquote>
  );
}

function SectionAccent() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-6 hidden -translate-x-1/2 lg:block"
      aria-hidden
    >
      <svg width="120" height="48" viewBox="0 0 120 48" fill="none" className="text-mkt-fg">
        <path
          d="M10 38C28 8 52 4 72 18c8 6 14 4 22-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M88 8l14 6-8 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="98" cy="6" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}

export function LandingTestimonialsSection() {
  const { title, lead, cta } = creatorsLanding.testimonialsSection;
  const cards = creatorsLanding.testimonials.slice(0, 3);
  const stackAlign: Array<"end" | "start" | "end"> = ["end", "start", "end"];

  return (
    <section
      className="relative overflow-hidden border-t border-mkt-border bg-mkt-bg text-mkt-fg"
      aria-labelledby="landing-testimonials-heading"
    >
      <SectionAccent />
      <div className={cn(mktContainer, mktSafeXWide, mktSectionY, "relative pb-24 pt-16 lg:pt-20")}>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
          <div className="max-w-md lg:max-w-lg">
            <h2
              id="landing-testimonials-heading"
              className="text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.12] tracking-tight"
            >
              {title}
            </h2>
            <p className="mt-5 text-base leading-7 text-mkt-fg-muted">{lead}</p>
            <Link
              href={routes.creator.root}
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {cta}
            </Link>
          </div>

          <div className="flex flex-col gap-5 sm:gap-6 lg:py-4">
            {cards.map((item, index) => (
              <TestimonialCard
                key={`${item.name}-${item.role}`}
                item={item}
                featured={index === 1}
                align={stackAlign[index] ?? "end"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
