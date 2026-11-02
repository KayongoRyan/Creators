"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { creatorsLanding } from "@/content/creatorsLanding";
import { unsplashPhoto, unsplashWidths } from "@/lib/images/unsplash";
import { mktSafeXWide, mktSectionY } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

const collageItems = [
  {
    id: "planning",
    src: unsplashPhoto("photo-1557804506-669a67965ba0", unsplashWidths.card, 70),
    alt: "Team planning a campaign",
    className: "left-[4%] top-[10%] z-10 h-[34%] w-[38%]",
  },
  {
    id: "motion",
    src: unsplashPhoto("photo-1571019614242-c5c5dee9f50b", unsplashWidths.card, 70),
    alt: "Creator in motion",
    className: "right-[5%] top-[6%] z-20 h-[36%] w-[40%]",
  },
  {
    id: "filming",
    src: unsplashPhoto("photo-1516321497487-e288fb19713f", unsplashWidths.section, 70),
    alt: "Creator filming content",
    className: "left-[26%] top-[28%] z-30 h-[52%] w-[48%]",
  },
  {
    id: "global",
    src: unsplashPhoto("photo-1451187580459-43490279c0fa", unsplashWidths.card, 70),
    alt: "Global reach",
    className: "left-[2%] bottom-[8%] z-20 h-[32%] w-[36%]",
  },
  {
    id: "collab",
    src: unsplashPhoto("photo-1522202176988-66273c2fd55f", unsplashWidths.card, 70),
    alt: "Collaborative workspace",
    className: "right-[4%] bottom-[6%] z-10 h-[34%] w-[38%]",
  },
] as const;

export function DeployCampaignSection() {
  const collageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = collageRef.current;
      if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const tiles = gsap.utils.toArray<HTMLElement>("[data-deploy-tile]", root);
      tiles.forEach((tile, i) => {
        gsap.to(tile, {
          y: i % 2 === 0 ? -10 : 10,
          duration: 3.5 + i * 0.25,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
    },
    { scope: collageRef },
  );

  return (
    <section
      id="mission"
      className="overflow-hidden border-t border-mkt-border bg-mkt-bg pb-4 text-mkt-fg sm:pb-6"
      aria-labelledby="mission-heading"
    >
      <div className="grid lg:grid-cols-2 lg:items-stretch">
        <div
          className={cn(
            mktSafeXWide,
            mktSectionY,
            "flex flex-col justify-center bg-mkt-bg lg:max-w-xl lg:pl-[max(2.5rem,8vw)]",
          )}
        >
          <h2
            id="mission-heading"
            className="max-w-lg text-balance text-[clamp(1.75rem,4.5vw,2.75rem)] font-semibold leading-[1.12] tracking-tight text-mkt-fg"
          >
            {creatorsLanding.mission.title}
          </h2>
          <p className="mt-8 max-w-md text-base leading-7 text-mkt-fg-muted sm:text-[1.05rem]">
            {creatorsLanding.mission.body}
          </p>
        </div>

        <div
          ref={collageRef}
          className="relative min-h-[24rem] border-t border-mkt-border bg-black sm:min-h-[28rem] lg:min-h-full lg:border-l lg:border-t-0 lg:border-white/10 xl:min-h-[36rem]"
          data-mkt-header-dark
        >
          {collageItems.map((item) => (
            <div
              key={item.id}
              data-deploy-tile
              className={cn("absolute overflow-hidden rounded-2xl sm:rounded-[1.1rem]", item.className)}
            >
              <OptimizedImage
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 28vw, 45vw"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
