"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { creatorsLanding } from "@/content/creatorsLanding";
import { routes } from "@/config/routes";
import { mktSafeXWide, mktSectionY } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

const collageItems = [
  {
    src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    alt: "Team planning a campaign",
    className: "left-[4%] top-[10%] z-10 h-[34%] w-[38%]",
  },
  {
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    alt: "Creator in motion",
    className: "right-[5%] top-[6%] z-20 h-[36%] w-[40%]",
  },
  {
    src: "https://images.unsplash.com/photo-1611162616472-9673feb421f5?auto=format&fit=crop&w=900&q=80",
    alt: "Creator filming content",
    className: "left-[26%] top-[28%] z-30 h-[52%] w-[48%]",
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    alt: "Global reach",
    className: "left-[2%] bottom-[8%] z-20 h-[32%] w-[36%]",
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
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
      id="start-campaign"
      className="overflow-hidden border-t border-mkt-border bg-mkt-bg text-mkt-fg"
      aria-labelledby="deploy-campaign-heading"
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
            id="deploy-campaign-heading"
            className="max-w-lg text-balance text-[clamp(1.75rem,4.5vw,2.75rem)] font-semibold leading-[1.12] tracking-tight text-mkt-fg"
          >
            {creatorsLanding.deploy.title}
          </h2>
          <p className="mt-8 max-w-md text-base leading-7 text-mkt-fg-muted sm:text-[1.05rem]">
            {creatorsLanding.deploy.body}
          </p>
          <Link
            href={routes.auth.register}
            className="mt-10 inline-flex w-fit text-sm font-medium text-mkt-fg underline decoration-1 underline-offset-[7px] transition hover:opacity-70 sm:mt-12 sm:text-base"
          >
            {creatorsLanding.deploy.cta}
          </Link>
        </div>

        <div
          ref={collageRef}
          className="relative min-h-[24rem] border-t border-mkt-border bg-black sm:min-h-[28rem] lg:min-h-full lg:border-l lg:border-t-0 lg:border-white/10 xl:min-h-[36rem]"
        >
          {collageItems.map((item) => (
            <div
              key={item.src}
              data-deploy-tile
              className={cn("absolute overflow-hidden rounded-2xl sm:rounded-[1.1rem]", item.className)}
            >
              <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="(min-width: 1024px) 28vw, 45vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
