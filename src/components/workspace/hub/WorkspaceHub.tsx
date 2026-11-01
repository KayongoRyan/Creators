"use client";

import Image from "next/image";
import Link from "next/link";
import { hubNicheTiles, hubSteps, hubTestimonials } from "@/content/workspaceHub";
import { BrandPartnersStrip } from "@/components/workspace/hub/BrandPartnersStrip";
import { BrandTrendingCampaigns } from "@/components/workspace/hub/BrandTrendingCampaigns";
import { CreatorSpotlightStrip } from "@/components/workspace/hub/CreatorSpotlightStrip";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

function HubArrowButton({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "creator" | "brand";
}) {
  const isBrand = variant === "brand";
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold",
        isBrand ? "bg-black text-white" : "bg-white text-black ring-1 ring-black/15",
      )}
    >
      {label}
      <span
        className={cn(
          "grid size-7 place-items-center rounded-full text-xs",
          isBrand ? "bg-white text-black" : "bg-black text-white",
        )}
      >
        ↗
      </span>
    </Link>
  );
}

function SectionTitle({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center")}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{eyebrow}</p>
      ) : null}
      <h2
        className={cn(
          "mt-2 text-balance text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl",
          align === "center" && "mx-auto max-w-2xl",
        )}
      >
        {title}
      </h2>
    </div>
  );
}

export function WorkspaceHub({
  variant,
  guest,
  afterHero,
}: {
  variant: "creator" | "brand";
  guest: boolean;
  afterHero?: React.ReactNode;
}) {
  const isCreator = variant === "creator";
  const steps = hubSteps[variant];
  const testimonials = hubTestimonials[variant];
  const joinHref = `${routes.auth.join}?role=${variant}&mode=signup`;
  const primaryHref = guest ? joinHref : isCreator ? routes.creator.campaigns : routes.brand.campaigns;
  const heroCta = guest ? "Join" : isCreator ? "Discover campaigns" : "Open campaigns";

  return (
    <div className="-mx-5 space-y-16 sm:-mx-8 sm:space-y-20 lg:space-y-24">
      <section className="px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {isCreator ? "Creators" : "Business"}
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.25rem]">
              {isCreator
                ? "The workspace built for modern creators."
                : "Launch creator campaigns without the chaos."}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-neutral-600">
              {isCreator
                ? "Find briefs, submit deliverables, and track payouts — aligned like a studio, not a spreadsheet."
                : "Brief the work, review content, and manage spend in one business workspace."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <HubArrowButton href={primaryHref} label={heroCta} variant={variant} />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-square max-h-[22rem] w-full overflow-hidden rounded-[2rem] bg-neutral-100 lg:max-h-none">
              <Image
                src={
                  isCreator
                    ? "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80"
                    : "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                }
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 480px, 80vw"
                priority
              />
            </div>
            <div className="absolute -left-2 top-8 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-black/10">
              80+ live briefs
            </div>
            <div className="absolute -right-1 bottom-12 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
              {isCreator ? "TikTok · IG · YT" : "Review queue"}
            </div>
          </div>
        </div>
      </section>

      {afterHero}

      {isCreator ? <CreatorSpotlightStrip /> : <BrandPartnersStrip />}

      {!isCreator ? <BrandTrendingCampaigns guest={guest} /> : null}

      {isCreator ? (
        <section className="px-5 sm:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-neutral-100 px-6 py-12 sm:px-10 sm:py-16">
            <SectionTitle
              align="center"
              eyebrow="Every niche"
              title="Creators for every brand — starting with yours."
            />
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {hubNicheTiles.map((tile) => (
                <figure
                  key={tile.tag}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-200"
                >
                  <Image src={tile.image} alt="" fill className="object-cover" sizes="25vw" />
                  <figcaption className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-neutral-900">
                    {tile.tag}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-neutral-900 px-5 py-14 text-white sm:px-8 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Process</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">How we work</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-[2px]"
            >
              <p className="text-xs font-semibold text-white/50">{step.n}</p>
              <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-8 sm:px-8">
        <SectionTitle eyebrow="Proof" title="Teams already shipping here" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-[1.5rem] bg-neutral-50 p-6 ring-1 ring-black/8"
            >
              <p className="text-base leading-7 text-neutral-800">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-neutral-900">
                {t.name}
                <span className="mt-0.5 block text-xs font-normal text-neutral-500">{t.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}
