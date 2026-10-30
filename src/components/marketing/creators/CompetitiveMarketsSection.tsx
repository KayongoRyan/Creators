"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { creatorsLanding } from "@/content/creatorsLanding";
import { routes } from "@/config/routes";
import { mktContainer, mktSafeXWide } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type MarketItem = (typeof creatorsLanding.markets.items)[number];
type MarketTab = MarketItem["tab"];

const PANEL_MOTION: Record<
  MarketItem["panel"],
  { variant: "marquee" | "stack" | "drift"; direction?: 1 | -1 }
> = {
  ink: { variant: "marquee", direction: 1 },
  paper: { variant: "stack" },
  chartreuse: { variant: "drift", direction: -1 },
  lilac: { variant: "marquee", direction: -1 },
  sand: { variant: "stack" },
  slate: { variant: "drift", direction: 1 },
};

function AnimatedWordOverlay({ item }: { item: MarketItem }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const word = item.title.toUpperCase();
  const motion = PANEL_MOTION[item.panel];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const tracks = gsap.utils.toArray<HTMLElement>("[data-market-word-track]", root);
      const stackWord = root.querySelector<HTMLElement>("[data-market-word-stack]");
      const driftWords = gsap.utils.toArray<HTMLElement>("[data-market-word-drift]", root);
      const tweens: gsap.core.Tween[] = [];

      tracks.forEach((track, row) => {
        const distance = track.scrollWidth / 2;
        tweens.push(
          gsap.fromTo(
            track,
            { x: 0 },
            { x: -distance, duration: 14 + row * 2, ease: "none", repeat: -1 },
          ),
        );
      });

      if (stackWord) {
        tweens.push(
          gsap.to(stackWord, {
            y: -12,
            duration: 2.8,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          }),
        );
      }

      driftWords.forEach((el, i) => {
        tweens.push(
          gsap.to(el, {
            x: (motion.direction ?? 1) * 18,
            y: i % 2 === 0 ? -10 : 10,
            duration: 3.2 + i * 0.4,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          }),
        );
      });

      return () => tweens.forEach((t) => t.kill());
    },
    { scope: rootRef, dependencies: [item.title, item.panel] },
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden text-white mix-blend-overlay"
      aria-hidden="true"
    >
      {motion.variant === "marquee" ? (
        <div className="absolute inset-x-0 top-[18%] flex flex-col gap-3 opacity-90">
          {[0, 1].map((row) => (
            <div key={row} className="overflow-hidden whitespace-nowrap">
              <div
                data-market-word-track
                className="inline-flex gap-6 pr-6 text-[clamp(1.35rem,3.2vw,2.25rem)] font-medium uppercase leading-none tracking-tight"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <span key={i}>{word}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {motion.variant === "stack" ? (
        <div className="absolute inset-x-0 bottom-0 flex justify-end p-5 sm:p-6">
          <span
            data-market-word-stack
            className="max-w-[90%] text-right text-[clamp(2rem,8vw,3.75rem)] font-medium uppercase leading-[0.88] tracking-tight opacity-95"
          >
            {word}
          </span>
        </div>
      ) : null}
      {motion.variant === "drift" ? (
        <div className="absolute inset-0 p-5 pt-16 sm:p-6 sm:pt-20">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[clamp(1.1rem,2.5vw,1.65rem)] font-medium uppercase leading-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} data-market-word-drift className="inline-block opacity-80">
                {word}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MarketCard({ item }: { item: MarketItem }) {
  return (
    <article className="group flex h-full min-h-0 flex-col" data-market-card>
      <div className="relative min-h-[14rem] flex-1 overflow-hidden bg-neutral-900 sm:min-h-[16rem] lg:min-h-[22rem] xl:min-h-[26rem]">
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/10" aria-hidden="true" />
        <AnimatedWordOverlay item={item} />
        <span
          className="absolute left-4 top-4 z-10 flex h-9 items-center rounded-full px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-mkt-fg sm:left-5 sm:top-5"
          style={{ backgroundColor: item.pillColor }}
        >
          {item.tag}
        </span>
      </div>
      <div className="shrink-0 pt-4 pr-4 sm:pt-5 sm:pr-10 lg:pt-5">
        <h3 className="text-lg font-medium leading-snug text-mkt-fg sm:text-[1.5rem] sm:leading-[1.26]">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-mkt-fg-muted">{item.body}</p>
      </div>
    </article>
  );
}

function MarketsBlock({
  id,
  activeTab,
  items,
  showIntro,
  showCta,
}: {
  id: string;
  activeTab: MarketTab;
  items: MarketItem[];
  showIntro?: boolean;
  showCta?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const workflowLabel = creatorsLanding.markets.tabs.workflow;
  const platformLabel = creatorsLanding.markets.tabs.platform;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const panel = panelRef.current;
      if (!section || !panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const cards = gsap.utils.toArray<HTMLElement>("[data-market-card]", panel);
      const tween = gsap.fromTo(
        cards,
        { opacity: 0, y: 56 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [activeTab] },
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        "flex min-h-[100svh] flex-col overflow-hidden bg-[#e9e9e9] text-mkt-fg",
        mktSafeXWide,
        "py-8 sm:py-10 lg:py-12",
      )}
      aria-labelledby={`${id}-heading`}
    >
      <div className={cn(mktContainer, "flex min-h-0 flex-1 flex-col lg:max-w-[80rem]")}>
        <div className="grid shrink-0 gap-6 lg:grid-cols-12 lg:gap-y-8">
          {showIntro ? (
            <p className="max-w-md text-sm leading-6 text-mkt-fg-muted lg:col-span-5 lg:pl-[min(8rem,12vw)] lg:text-base lg:leading-7">
              {creatorsLanding.markets.intro}
            </p>
          ) : (
            <div className="hidden lg:col-span-5 lg:block" aria-hidden="true" />
          )}

          <div className="flex flex-col items-start gap-5 lg:col-span-12 lg:flex-row lg:items-end lg:gap-0">
            <div
              id={`${id}-heading`}
              className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-8 lg:-ml-1 lg:gap-14"
            >
              <h2
                className={cn(
                  "font-medium uppercase leading-[0.92] tracking-tight text-[clamp(2.5rem,8vw,5.25rem)]",
                  activeTab === "workflow" ? "text-mkt-fg opacity-100" : "text-mkt-fg opacity-25",
                )}
              >
                {workflowLabel}
              </h2>
              <h2
                className={cn(
                  "font-medium uppercase leading-[0.92] tracking-tight text-[clamp(2.5rem,8vw,5.25rem)]",
                  activeTab === "platform" ? "text-mkt-fg opacity-100" : "text-mkt-fg opacity-25",
                )}
              >
                {platformLabel}
              </h2>
            </div>

            {showCta ? (
              <Link
                href={routes.auth.register}
                className="hidden text-sm text-mkt-fg underline decoration-1 underline-offset-[6px] transition hover:opacity-70 sm:inline-flex lg:ml-auto lg:mb-2"
              >
                Start on Creators
              </Link>
            ) : null}
          </div>
        </div>

        <div ref={panelRef} className="mt-6 flex min-h-0 flex-1 flex-col sm:mt-8 lg:mt-10">
          <div className="grid min-h-0 flex-1 auto-rows-fr gap-6 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3 lg:gap-x-6">
            {items.map((item) => (
              <MarketCard key={item.title} item={item} />
            ))}
          </div>
        </div>

        {showCta ? (
          <Link
            href={routes.auth.register}
            className="mt-6 inline-flex shrink-0 text-sm text-mkt-fg underline decoration-1 underline-offset-[6px] transition hover:opacity-70 sm:hidden"
          >
            Start on Creators
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function CompetitiveMarketsSection() {
  const itemsByTab = useMemo(() => {
    const workflow = creatorsLanding.markets.items.filter((i) => i.tab === "workflow");
    const platform = creatorsLanding.markets.items.filter((i) => i.tab === "platform");
    return { workflow, platform };
  }, []);

  return (
    <div id="competitive-markets">
      <MarketsBlock
        id="markets-workflow"
        activeTab="workflow"
        items={itemsByTab.workflow}
        showIntro
        showCta
      />
      <MarketsBlock
        id="markets-platform"
        activeTab="platform"
        items={itemsByTab.platform}
      />
    </div>
  );
}
