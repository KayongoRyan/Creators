import Image from "next/image";
import Link from "next/link";
import { routes } from "@/config/routes";
import { mktContainer, mktSafeXWide, mktSectionTitle } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

type PathCard = {
  step: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
};

const paths: PathCard[] = [
  {
    step: "1.",
    eyebrow: "For creators",
    title: "Make your work your next opportunity.",
    body: "Share your niches, find briefs that fit your style, and keep applications, deliverables, and payouts together.",
    href: `${routes.auth.register}?role=creator`,
    cta: "Join as a creator",
    image:
      "https://images.unsplash.com/photo-1611162616472-9673feb421f5?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Creator filming content",
  },
  {
    step: "2.",
    eyebrow: "For brands",
    title: "Brief the work. Meet the right creators.",
    body: "Launch a campaign, review creator applications, and manage content from the first brief through final delivery.",
    href: `${routes.auth.register}?role=brand`,
    cta: "Create a brand account",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Brand team planning a campaign",
  },
];

const CARD_WIDTH = "w-full max-w-[min(100%,24rem)] sm:max-w-[26rem]";

function PathVisual({ image, imageAlt }: { image: string; imageAlt: string }) {
  return (
    <div className={cn("relative mx-auto", CARD_WIDTH)}>
      <div className="relative aspect-[3/4] w-full max-h-[min(58vh,34rem)]">
        <div
          className="absolute inset-x-[10%] top-0 z-0 h-[78%] overflow-hidden rounded-2xl bg-neutral-800 opacity-35 sm:rounded-[1.15rem]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-[10%] bottom-0 z-0 h-[78%] overflow-hidden rounded-2xl bg-neutral-800 opacity-35 sm:rounded-[1.15rem]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl bg-neutral-900 sm:rounded-[1.15rem]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 416px, 85vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}

function PathCardBlock({ card }: { card: PathCard }) {
  return (
    <article className={cn("flex flex-col", CARD_WIDTH)}>
      <header className="mb-6 sm:mb-8">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
          {card.eyebrow}
        </p>
        <p className="mt-4 tabular-nums text-[clamp(2.75rem,6vw,4.75rem)] font-medium leading-none tracking-tight text-white">
          {card.step}
        </p>
        <h3 className="mt-3 text-balance text-[clamp(1.5rem,3vw,2.125rem)] font-semibold leading-[1.15] tracking-tight text-white sm:mt-4">
          {card.title}
        </h3>
      </header>

      <PathVisual image={card.image} imageAlt={card.imageAlt} />

      <div className="mt-8 flex flex-col gap-5 sm:mt-10">
        <p className="text-pretty text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
          {card.body}
        </p>
        <Link
          href={card.href}
          className="inline-flex min-h-11 w-fit items-center text-base font-medium text-white underline decoration-1 underline-offset-[8px] transition hover:text-white/80"
        >
          {card.cta}
        </Link>
      </div>
    </article>
  );
}

export function AudiencePathsSection() {
  return (
    <section className="border-y border-mkt-border bg-mkt-bg">
      <div className={cn(mktContainer, mktSafeXWide, "py-14 sm:py-16 lg:py-20")}>
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-mkt-accent">
          Choose your path
        </p>
        <h2 className={cn("mt-4 max-w-4xl text-mkt-fg", mktSectionTitle, "sm:text-[2.5rem] lg:text-5xl")}>
          One platform. Two ways to grow.
        </h2>
      </div>

      <div className="bg-black text-white">
        <div
          className={cn(
            mktContainer,
            mktSafeXWide,
            "mx-auto flex w-full max-w-[80rem] flex-col justify-center py-14 sm:py-16 lg:min-h-[min(92svh,52rem)] lg:py-16 xl:py-20",
          )}
        >
          <div className="grid grid-cols-1 gap-14 sm:gap-16 lg:grid-cols-2 lg:gap-x-0">
            {paths.map((card, index) => (
              <div
                key={card.eyebrow}
                className={cn(
                  "flex justify-center",
                  index > 0 && "border-t border-white/10 pt-14 sm:pt-16 lg:border-t-0 lg:pt-0",
                  index === 0 && "lg:justify-end lg:pr-10 xl:pr-14",
                  index === 1 && "lg:justify-start lg:border-l lg:border-white/10 lg:pl-10 xl:pl-14",
                )}
              >
                <PathCardBlock card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
