"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { whopLanding } from "@/content/whopLanding";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

function Section({
  className,
  children,
  id,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("mx-auto w-full max-w-6xl px-6 py-20 sm:px-8", className)}
    >
      {children}
    </section>
  );
}

function RotatingSuggestions() {
  const items = whopLanding.economicIntelligence.suggestions;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <div className="relative mt-10 min-h-[4.5rem] overflow-hidden rounded-2xl border border-mkt-border bg-mkt-card px-6 py-5">
      {items.map((line, i) => (
        <p
          key={line}
          className={cn(
            "absolute inset-x-6 top-5 text-lg font-medium tracking-tight text-mkt-fg transition-all duration-500 sm:text-xl",
            i === index
              ? "translate-y-0 opacity-100"
              : i === (index - 1 + items.length) % items.length
                ? "-translate-y-3 opacity-0"
                : "translate-y-3 opacity-0",
          )}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function ApiShowcase() {
  const tabs = whopLanding.api.tabs;
  type TabId = (typeof tabs)[number]["id"];
  const [active, setActive] = useState<TabId>(tabs[0].id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,11rem)_1fr]">
      <div className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-[var(--m-tab-active-bg)] text-[var(--m-tab-active-fg)]"
                : "text-mkt-fg-muted hover:bg-mkt-muted hover:text-mkt-fg",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-w-0 rounded-2xl border border-mkt-border bg-mkt-code">
        <div className="border-b border-mkt-border px-5 py-4">
          <p className="text-sm font-medium text-mkt-fg">{current.label}</p>
          <p className="mt-1 text-sm text-mkt-fg-muted">{current.description}</p>
        </div>
        <pre className="overflow-x-auto p-5 text-[11px] leading-relaxed text-mkt-code sm:text-xs">
          <code>{current.code}</code>
        </pre>
      </div>
    </div>
  );
}

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-mkt-accent px-6 text-sm font-semibold text-mkt-on-accent transition hover:bg-mkt-accent-hi";
const btnGhost =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-mkt-border px-6 text-sm font-semibold text-mkt-fg transition hover:bg-mkt-muted";

export function WhopLanding() {
  type FeaturedName = (typeof whopLanding.featured.names)[number];
  const [spotlight, setSpotlight] = useState<FeaturedName>(
    whopLanding.featured.names[0],
  );

  return (
    <div className="bg-mkt-bg text-mkt-fg">
      <Section className="pb-16 pt-12 sm:pt-20">
        <p className="text-sm text-mkt-fg-subtle">{whopLanding.metaLine}</p>
        <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          {whopLanding.hero.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-mkt-fg-muted sm:text-xl">
          {whopLanding.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={routes.auth.register} className={btnPrimary}>
            Get started
          </Link>
          <Link href={routes.auth.login} className={btnGhost}>
            Sign in
          </Link>
        </div>
      </Section>

      <Section className="border-t border-mkt-border py-16">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {whopLanding.economicIntelligence.title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-mkt-fg-muted">
          {whopLanding.economicIntelligence.lead}
        </p>
        <RotatingSuggestions />
        <ul className="mt-8 grid gap-2 sm:grid-cols-2">
          {whopLanding.economicIntelligence.suggestions.map((item) => (
            <li key={item} className="text-sm text-mkt-fg-subtle">
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-t border-mkt-border">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {whopLanding.agentic.title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-mkt-fg-muted">
          {whopLanding.agentic.lead}
        </p>
        <pre className="mt-10 overflow-x-auto rounded-2xl border border-mkt-border bg-mkt-code p-5 text-[11px] leading-relaxed text-mkt-code sm:text-xs">
          <code>{whopLanding.agentic.terminal}</code>
        </pre>
      </Section>

      <Section className="border-t border-mkt-border">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {whopLanding.markets.title}
        </h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whopLanding.markets.items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-mkt-border bg-mkt-card p-6"
            >
              <h3 className="text-lg font-semibold text-mkt-accent">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-mkt-fg-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-t border-mkt-border">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {whopLanding.api.title}
        </h2>
        <ApiShowcase />
      </Section>

      <Section className="border-t border-mkt-border text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          {whopLanding.deploy.title}
        </h2>
        <Link href={routes.auth.register} className={cn(btnPrimary, "mt-8 px-8")}>
          Start now
        </Link>
      </Section>

      <Section className="border-t border-mkt-border">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {whopLanding.featured.title}
        </h2>
        <div className="mt-8 flex flex-wrap gap-2">
          {whopLanding.featured.names.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSpotlight(name)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                spotlight === name
                  ? "border-transparent bg-[var(--m-pill-active-bg)] text-[var(--m-pill-active-fg)]"
                  : "border-mkt-border text-mkt-fg-muted hover:border-mkt-accent hover:text-mkt-fg",
              )}
            >
              {name}
            </button>
          ))}
        </div>
        <div
          className="mt-10 rounded-2xl border border-mkt-border p-8"
          style={{ background: "var(--m-spotlight)" }}
        >
          <h3 className="text-xl font-semibold">
            {spotlight === whopLanding.featured.spotlight.name
              ? whopLanding.featured.spotlight.name
              : spotlight}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-mkt-fg-muted">
            {spotlight === whopLanding.featured.spotlight.name
              ? whopLanding.featured.spotlight.body
              : "Built on Whop to launch, sell, and scale with payments, ads, and community in one place."}
          </p>
        </div>
      </Section>

      <Section className="border-t border-mkt-border pb-24">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {whopLanding.mission.title}
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-7 text-mkt-fg-muted">
          {whopLanding.mission.body}
        </p>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-mkt-fg-subtle">
          <p>
            Press Inquiries:{" "}
            <a className="text-mkt-accent hover:underline" href={`mailto:${whopLanding.mission.press}`}>
              {whopLanding.mission.press}
            </a>
          </p>
          <p>
            Support Inquiries:{" "}
            <a
              className="text-mkt-accent hover:underline"
              href={`mailto:${whopLanding.mission.support}`}
            >
              {whopLanding.mission.support}
            </a>
          </p>
        </div>
      </Section>
    </div>
  );
}
