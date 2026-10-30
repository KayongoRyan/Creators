"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRef } from "react";
import { marketingJoinCta } from "@/config/navigation";
import { routes } from "@/config/routes";
import { creatorsLanding } from "@/content/creatorsLanding";
import { cn } from "@/lib/utils/cn";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function FooterArrow({ className }: { className?: string }) {
  return (
    <span className={cn("inline-block leading-none", className)} aria-hidden="true">
      →
    </span>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a href={href} className="mkt-footer-link group inline-flex items-center gap-2 text-sm">
        {label}
        <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          ↗
        </span>
      </a>
    </li>
  );
}

const quickLinksLeft = [
  { href: routes.public.home, label: "Home" },
  { href: routes.creator.campaigns, label: "Discover campaigns" },
  { href: routes.public.apply, label: "Apply as creator" },
  { href: "#how-earnings-work", label: "How you earn" },
] as const;

const quickLinksRight = [
  { href: routes.auth.register, label: "Register your business" },
  { href: marketingJoinCta.href, label: "Sign in" },
  { href: routes.brand.root, label: "Brand workspace" },
  { href: routes.creator.root, label: "Creator workspace" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const footer = footerRef.current;
      const inner = innerRef.current;
      const pattern = patternRef.current;
      if (!footer || !inner || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.set(inner, { yPercent: -35, opacity: 0.92 });
      if (pattern) {
        gsap.set(pattern, { yPercent: 8, scale: 1.08 });
      }

      const reveal = gsap.to(inner, {
        yPercent: 0,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: footer,
          start: "top bottom",
          end: "top 25%",
          scrub: 0.65,
        },
      });

      const patternTween = pattern
        ? gsap.to(pattern, {
            yPercent: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.85,
            },
          })
        : null;

      const blocks = gsap.utils.toArray<HTMLElement>("[data-footer-reveal]", inner);
      const blockTween = gsap.fromTo(
        blocks,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        },
      );

      return () => {
        reveal.scrollTrigger?.kill();
        reveal.kill();
        patternTween?.scrollTrigger?.kill();
        patternTween?.kill();
        blockTween.scrollTrigger?.kill();
        blockTween.kill();
      };
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef} className="mt-auto overflow-hidden">
      <div className="mkt-footer-shell relative overflow-hidden rounded-t-[3rem] sm:rounded-t-[4.5rem] lg:rounded-t-[5.5rem]">
        <div
          ref={patternRef}
          className="mkt-footer-pattern pointer-events-none absolute inset-0 will-change-transform"
          aria-hidden="true"
        />

        <div
          ref={innerRef}
          className="relative z-10 mx-auto max-w-6xl px-[max(1.25rem,env(safe-area-inset-left,0px))] pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] pt-14 pr-[max(1.25rem,env(safe-area-inset-right,0px))] will-change-transform sm:px-8 sm:pb-12 sm:pt-16"
        >
          <div data-footer-reveal className="flex flex-col items-center text-center">
            <Link href={routes.public.home} className="inline-flex flex-col items-center gap-4">
              <svg
                width="56"
                height="56"
                viewBox="0 0 32 32"
                className="mkt-footer-logo"
                aria-hidden="true"
              >
                <rect width="32" height="32" rx="8" />
                <path
                  d="M21.2 10.2a7.4 7.4 0 1 0 .2 11.7"
                  fill="none"
                  strokeWidth="2.7"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-3xl font-semibold tracking-tight sm:text-4xl">Creators</span>
            </Link>
            <p className="mkt-footer-muted mt-3 max-w-md text-sm italic sm:text-base">
              {creatorsLanding.hero.subtitle}
            </p>

            <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={routes.auth.register}
                className="mkt-footer-btn-primary inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition sm:flex-none sm:px-8"
              >
                Get started
                <FooterArrow />
              </Link>
              <Link
                href={marketingJoinCta.href}
                className="mkt-footer-btn-secondary inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-transparent px-6 text-sm font-semibold transition sm:flex-none sm:px-8"
              >
                {marketingJoinCta.label}
                <FooterArrow />
              </Link>
            </div>
          </div>

          <div data-footer-reveal className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <div>
              <h3 className="mkt-footer-subtle text-sm font-semibold uppercase tracking-wider">
                Contact
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href={`mailto:${creatorsLanding.mission.press}`} className="mkt-footer-link">
                    {creatorsLanding.mission.press}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${creatorsLanding.mission.support}`} className="mkt-footer-link">
                    {creatorsLanding.mission.support}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mkt-footer-subtle text-sm font-semibold uppercase tracking-wider">
                Socials
              </h3>
              <ul className="mt-4 space-y-2">
                <SocialLink href="#" label="LinkedIn" />
                <SocialLink href="#" label="Instagram" />
                <SocialLink href="#" label="X" />
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="mkt-footer-subtle text-sm font-semibold uppercase tracking-wider">
                Quick links
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-y-2 text-sm min-[420px]:grid-cols-2 min-[420px]:gap-x-6">
                <ul className="space-y-2">
                  {quickLinksLeft.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="mkt-footer-link">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {quickLinksRight.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="mkt-footer-link">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div data-footer-reveal className="mt-14 flex justify-center">
            <div className="mkt-footer-legal-pill inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full px-5 py-2.5 text-xs">
              <Link href="#" className="mkt-footer-link">
                Privacy policy
              </Link>
              <Link href="#" className="mkt-footer-link">
                Terms of use
              </Link>
              <span>© {year} Creators</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
